import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: any[];
  isActive: boolean;
  createdAt: string;
  selected?: boolean;
}

const GET_USERS = gql`
  query {
    users {
      id
      first_name
      last_name
      email
      roles {
        id
        name
      }
      isActive
      createdAt
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      first_name
      last_name
      email
      roles {
        id
        name
      }
      isActive
      createdAt
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      first_name
      last_name
      email
      roles {
        id
        name
      }
      isActive
      createdAt
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apollo: Apollo) {}

  getUsers(): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_USERS,
      fetchPolicy: 'network-only'
    }).valueChanges;
  }

  createUser(
    first_name: string, 
    last_name: string, 
    email: string, 
    password: string, 
    roleIds: string[] = [], 
    isActive: boolean = true
  ): Observable<any> {
    return this.apollo.mutate({
      mutation: CREATE_USER,
      variables: {
        input: {
          first_name,
          last_name,
          email,
          password,
          roleIds,
          isActive
        }
      },
      refetchQueries: [{
        query: GET_USERS
      }]
    });
  }

  updateUser(user: User): Observable<any> {
    const roleIds = user.roles.map(role => role.id);
    
    return this.apollo.mutate({
      mutation: UPDATE_USER,
      variables: {
        id: user.id,
        input: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          roleIds,
          isActive: user.isActive
        }
      },
      refetchQueries: [{
        query: GET_USERS
      }]
    });
  }

  deleteUser(id: string): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_USER,
      variables: {
        id
      },
      refetchQueries: [{
        query: GET_USERS
      }]
    });
  }
}