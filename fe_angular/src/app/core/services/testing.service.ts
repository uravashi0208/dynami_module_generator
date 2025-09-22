import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

export interface Testing {
  id: string;
  name: string;
  lastname: string;
  createdAt: string;
  updatedAt: string;
}

const GET_TESTINGS = gql`
  query {
    testings {
      id
      name
      lastname
      createdAt
      updatedAt
    }
  }
`;

const GET_TESTING = gql`
  query GetTesting($id: ID!) {
    testing(id: $id) {
      id
      name
      lastname
      createdAt
      updatedAt
    }
  }
`;

const CREATE_TESTING = gql`
  mutation CreateTesting($input: CreateTestingInput!) {
    createTesting(input: $input) {
      id
      name
      lastname
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_TESTING = gql`
  mutation UpdateTesting($id: ID!, $input: UpdateTestingInput!) {
    updateTesting(id: $id, input: $input) {
      id
      name
      lastname
      updatedAt
    }
  }
`;

const DELETE_TESTING = gql`
  mutation DeleteTesting($id: ID!) {
    deleteTesting(id: $id)
  }
`;

@Injectable({
  providedIn: 'root'
})
export class TestingService {
  constructor(private apollo: Apollo) {}

  getTestings(): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_TESTINGS,
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map((result: any) => result.data?.testings || []),
      catchError(error => {
        console.error('Error fetching testings:', error);
        return throwError(() => new Error('Failed to fetch testings'));
      })
    );
  }

  getTesting(id: string): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_TESTING,
      variables: { id },
      fetchPolicy: 'network-only'
    }).valueChanges.pipe(
      map((result: any) => result.data?.testing),
      catchError(error => {
        console.error('Error fetching testing:', error);
        return throwError(() => new Error('Failed to fetch testing'));
      })
    );
  }

  createTesting(input: any): Observable<any> {
    return this.apollo.mutate({
      mutation: CREATE_TESTING,
      variables: { input },
      refetchQueries: [{
        query: GET_TESTINGS,
        fetchPolicy: 'network-only'
      }]
    }).pipe(
      map((result: any) => result.data?.createTesting),
      catchError(error => {
        console.error('Error creating testing:', error);
        return throwError(() => new Error('Failed to create testing: ' + error.message));
      })
    );
  }

  updateTesting(id: string, input: any): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_TESTING,
      variables: { id, input },
      refetchQueries: [{
        query: GET_TESTINGS,
        fetchPolicy: 'network-only'
      }]
    }).pipe(
      map((result: any) => result.data?.updateTesting),
      catchError(error => {
        console.error('Error updating testing:', error);
        return throwError(() => new Error('Failed to update testing: ' + error.message));
      })
    );
  }

  deleteTesting(id: string): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_TESTING,
      variables: { id },
      refetchQueries: [{
        query: GET_TESTINGS,
        fetchPolicy: 'network-only'
      }]
    }).pipe(
      map((result: any) => result.data?.deleteTesting),
      catchError(error => {
        console.error('Error deleting testing:', error);
        return throwError(() => new Error('Failed to delete testing: ' + error.message));
      })
    );
  }
}