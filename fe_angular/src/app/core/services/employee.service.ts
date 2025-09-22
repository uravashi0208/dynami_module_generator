import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface Employee {
  id: string;
  name: string;
  salary: number;
  createdAt: string;
  updatedAt: string;
}

const GET_EMPLOYEES = gql`
  query {
    employees {
      id
      name
      salary
      createdAt
      updatedAt
    }
  }
`;

const GET_EMPLOYEE = gql`
  query GetEmployee($id: ID!) {
    employee(id: $id) {
      id
      name
      salary
      createdAt
      updatedAt
    }
  }
`;

const CREATE_EMPLOYEE = gql`
  mutation CreateEmployee($input: CreateEmployeeInput!) {
    createEmployee(input: $input) {
      id
      name
      salary
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_EMPLOYEE = gql`
  mutation UpdateEmployee($id: ID!, $input: UpdateEmployeeInput!) {
    updateEmployee(id: $id, input: $input) {
      id
      name
      salary
      updatedAt
    }
  }
`;

const DELETE_EMPLOYEE = gql`
  mutation DeleteEmployee($id: ID!) {
    deleteEmployee(id: $id)
  }
`;

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(private apollo: Apollo) {}

  getEmployees(): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_EMPLOYEES,
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map((result: any) => result.data?.employees || []),
      catchError(error => {
        console.error('Error fetching employees:', error);
        return throwError(() => new Error('Failed to fetch employees'));
      })
    );
  }

  getEmployee(id: string): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_EMPLOYEE,
      variables: { id },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map((result: any) => result.data?.employee),
      catchError(error => {
        console.error('Error fetching employee:', error);
        return throwError(() => new Error('Failed to fetch employee'));
      })
    );
  }

  createEmployee(input: any): Observable<any> {
    return this.apollo.mutate({
      mutation: CREATE_EMPLOYEE,
      variables: { input },
      refetchQueries: [{
        query: GET_EMPLOYEES,
        fetchPolicy: 'network-only'
      }]
    }).pipe(
      map((result: any) => result.data?.createEmployee),
      catchError(error => {
        console.error('Error creating employee:', error);
        return throwError(() => new Error('Failed to create employee: ' + error.message));
      })
    );
  }

  updateEmployee(id: string, input: any): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_EMPLOYEE,
      variables: { id, input },
      refetchQueries: [{
        query: GET_EMPLOYEES,
        fetchPolicy: 'network-only'
      }]
    }).pipe(
      map((result: any) => result.data?.updateEmployee),
      catchError(error => {
        console.error('Error updating employee:', error);
        return throwError(() => new Error('Failed to update employee: ' + error.message));
      })
    );
  }

  deleteEmployee(id: string): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_EMPLOYEE,
      variables: { id },
      refetchQueries: [{
        query: GET_EMPLOYEES,
        fetchPolicy: 'network-only'
      }]
    }).pipe(
      map((result: any) => result.data?.deleteEmployee),
      catchError(error => {
        console.error('Error deleting employee:', error);
        return throwError(() => new Error('Failed to delete employee: ' + error.message));
      })
    );
  }
}