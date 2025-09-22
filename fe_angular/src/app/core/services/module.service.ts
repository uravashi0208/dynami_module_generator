import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';

export interface Field {
  name: string;
  label: string;
  dataType: string;
  isRequired: boolean;
  isUnique: boolean;
  ref?: string;
}

export interface Module {
  id: string;
  name: string;
  fields: Field[];
  createdAt: string;
}

const GET_MODULES = gql`
  query {
    modules {
      id
      name
      fields {
        name
        label
        dataType
        isRequired
        isUnique
        ref
      }
      createdAt
    }
  }
`;

const GET_MODULE = gql`
  query GetModule($name: String!) {
    module(name: $name) {
      id
      name
      fields {
        name
        label
        dataType
        isRequired
        isUnique
        ref
      }
      createdAt
    }
  }
`;

const CREATE_MODULE = gql`
  mutation CreateModule($input: CreateModuleInput!) {
    createModule(input: $input) {
      id
      name
      fields {
        name
        label
        dataType
        isRequired
        isUnique
        ref
      }
      createdAt
    }
  }
`;

const UPDATE_MODULE = gql`
  mutation UpdateModule($name: String!, $input: UpdateModuleInput!) {
    updateModule(name: $name, input: $input) {
      id
      name
      fields {
        name
        label
        dataType
        isRequired
        isUnique
        ref
      }
      createdAt
    }
  }
`;

const DELETE_MODULE = gql`
  mutation DeleteModule($name: String!) {
    deleteModule(name: $name)
  }
`;

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  constructor(private apollo: Apollo) {}

  getModules(): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_MODULES,
      fetchPolicy: 'network-only'
    }).valueChanges;
  }

  getModule(name: string): Observable<any> {
    return this.apollo.watchQuery({
      query: GET_MODULE,
      variables: { name },
      fetchPolicy: 'network-only'
    }).valueChanges;
  }

  createModule(name: string, fields: Field[]): Observable<any> {
    return this.apollo.mutate({
      mutation: CREATE_MODULE,
      variables: {
        input: { name, fields }
      },
      refetchQueries: [{
        query: GET_MODULES
      }]
    });
  }

  updateModule(name: string, fields: Field[]): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_MODULE,
      variables: {
        name,
        input: { fields }
      },
      refetchQueries: [{
        query: GET_MODULES
      }]
    });
  }

  deleteModule(name: string): Observable<any> {
    return this.apollo.mutate({
      mutation: DELETE_MODULE,
      variables: { name },
      refetchQueries: [{
        query: GET_MODULES
      }]
    });
  }
}