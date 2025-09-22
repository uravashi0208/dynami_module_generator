import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { Observable, map, catchError, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { toast } from 'ngx-sonner';

export interface Role {
  createdAt: string;
  id: string;
  name: string;
  isActive?: boolean;
}

export interface RolesResponse {
  roles: Role[];
}

export interface RoleResponse {
  role: Role;
}

export interface CreateRoleResponse {
  createRole: Role;
}


export interface UpdateRoleResponse {
  updateRole: Role;
}

export interface DeleteRoleResponse {
  deleteRole: boolean;
}

const GET_ROLES_QUERY = gql`
  query GetRoles {
    roles {
      id
      name
      isActive
    }
  }
`;

const GET_ROLE_QUERY = gql`
  query GetRole($id: ID!) {
    role(id: $id) {
      id
      name
      isActive
    }
  }
`;

const CREATE_ROLE_MUTATION = gql`
  mutation CreateRole($name: String!) {
    createRole(name: $name) {
      id
      name
      isActive
    }
  }
`;

const UPDATE_ROLE_MUTATION = gql`
  mutation UpdateRole($id: ID!, $name: String, $isActive: Boolean) {
    updateRole(id: $id, name: $name, isActive: $isActive) {
      id
      name
      isActive
    }
  }
`;

const DELETE_ROLE_MUTATION = gql`
  mutation DeleteRole($id: ID!) {
    deleteRole(id: $id)
  }
`;

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(private apollo: Apollo) {}

  getRoles(): Observable<Role[]> {
    return this.apollo.query<RolesResponse>({
      query: GET_ROLES_QUERY,
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.roles),
      catchError(error => {
        console.error('Get roles error:', error);
        const errorMessage = error.message || 'Failed to fetch roles.';
        toast.error(errorMessage, {
          position: 'bottom-right',
        });
        return throwError(() => error);
      })
    );
  }

  getRole(id: string): Observable<Role> {
    return this.apollo.query<RoleResponse>({
      query: GET_ROLE_QUERY,
      variables: { id },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.role),
      catchError(error => {
        console.error('Get role error:', error);
        const errorMessage = error.message || 'Failed to fetch role.';
        toast.error(errorMessage, {
          position: 'bottom-right',
        });
        return throwError(() => error);
      })
    );
  }

  createRole(name: string, isActive: boolean = true): Observable<Role> {
    return this.apollo.mutate<CreateRoleResponse>({
      mutation: CREATE_ROLE_MUTATION,
      variables: { name, isActive },
      refetchQueries: [{ query: GET_ROLES_QUERY }]
    }).pipe(
      map(result => result.data!.createRole),
      tap(role => {
        toast.success('Role created successfully', {
          description: `Role "${role.name}" has been created.`,
          position: 'bottom-right',
          duration: 3000,
        });
      }),
      catchError(error => {
        console.error('Create role error:', error);
        const errorMessage = error.message || 'Failed to create role.';
        toast.error(errorMessage, {
          position: 'bottom-right',
        });
        return throwError(() => error);
      })
    );
  }

  deleteRole(id: string): Observable<boolean> {
    return this.apollo.mutate<DeleteRoleResponse>({
      mutation: DELETE_ROLE_MUTATION,
      variables: { id },
      refetchQueries: [{ query: GET_ROLES_QUERY }]
    }).pipe(
      map(result => result.data!.deleteRole),
      tap(success => {
        if (success) {
          toast.success('Role deleted successfully!', {
            position: 'bottom-right',
          });
        }
      }),
      catchError(error => {
        const errorMessage = error.message || 'Failed to delete role.';
        toast.error(errorMessage, {
          position: 'bottom-right',
        });
        return throwError(() => error);
      })
    );
  }


  updateRole(role: Role): Observable<Role> {
  return this.apollo.mutate<UpdateRoleResponse>({
    mutation: UPDATE_ROLE_MUTATION,
    variables: { 
      id: role.id, 
      name: role.name, 
      isActive: role.isActive 
    },
    refetchQueries: [{ query: GET_ROLES_QUERY }]
  }).pipe(
    map(result => result.data!.updateRole),
    tap(updatedRole => {
      toast.success(`Role "${updatedRole.name}" updated successfully!`, {
        position: 'bottom-right',
      });
    }),
    catchError(error => {
      const errorMessage = error.message || 'Failed to update role.';
      toast.error(errorMessage, {
        position: 'bottom-right',
      });
      return throwError(() => error);
    })
  );
}
}