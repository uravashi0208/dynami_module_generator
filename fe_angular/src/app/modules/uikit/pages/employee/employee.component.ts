import { Component, computed, OnInit, signal, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { toast } from 'ngx-sonner';
import { EmployeeService, Employee } from 'src/app/core/services/employee.service';
import { TableFooterComponent } from '../table/components/table-footer/table-footer.component';
import { TableFilterService } from '../table/services/table-filter.service';

@Component({
  selector: 'app-employee',
  imports: [
    AngularSvgIconModule,
    FormsModule,
    TableFooterComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css',
})
export class EmployeeComponent implements OnInit {
  employees = signal<Employee[]>([]);
  @Output() onCheck = new EventEmitter<boolean>();
  showEmployeeForm = false;
  editingEmployee: Employee | null = null;
  employeeForm!: FormGroup;
  protected readonly toast = toast;

  // Pagination properties
  currentPage = signal(1);
  itemsPerPage = signal(5);
  totalItems = computed(() => this.filteredEmployees().length);

  constructor(
    private employeeService: EmployeeService, 
    private filterService: TableFilterService,
    private readonly _formBuilder: FormBuilder
  ) {
    this.employeeForm = this._formBuilder.group({
      name: ['', Validators.required],
      salary: ['', Validators.required]
    });

    this.loadEmployees();
  }

  private loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: ({ data }) => {
        this.employees.set(data.employees);
      },
      error: (error) => {
        this.handleRequestError(error, 'employees');
      },
    });
  }

  private handleRequestError(error: any, entity: string) {
    const msg = `An error occurred while fetching ${entity}.`;
    toast.error(msg, {
      position: 'bottom-right',
      description: error.message,
      action: {
        label: 'Retry',
        onClick: () => this.loadEmployees(),
      },
      actionButtonStyle: 'background-color:#DC2626; color:white;',
    });
  }

  filteredEmployees = computed(() => {
    const search = this.filterService.searchField().toLowerCase();
    
    return this.employees()
      .filter((employee) =>
        employee.name?.toString().toLowerCase().includes(search) ||
        employee.salary?.toString().toLowerCase().includes(search)
      );
  });

  // Get paginated employees
  paginatedEmployees = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.filteredEmployees().slice(startIndex, endIndex);
  });

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.itemsPerPage.set(size);
    this.currentPage.set(1);
  }

  onSearchChange(value: Event) {
    const input = value.target as HTMLInputElement;
    this.filterService.searchField.set(input.value);
  }

  public toggle(event: Event) {
    const value = (event.target as HTMLInputElement).checked;
    this.onCheck.emit(value); 
  }

  // Employee form methods
  openEmployeeForm(employee?: Employee) {
    if (employee) {
      this.editingEmployee = employee;
      this.employeeForm.patchValue({
        name: employee.name,
        salary: employee.salary
      });
    } else {
      this.editingEmployee = null;
      this.employeeForm.reset();
    }
    this.showEmployeeForm = true;
  }
  
  closeEmployeeForm() {
    this.showEmployeeForm = false;
    this.employeeForm.reset();
    this.editingEmployee = null;
  }
  
  saveEmployee() {
    if (this.employeeForm.valid) {
      const formData = this.employeeForm.value;
      
      if (this.editingEmployee) {
        // Update existing employee
        this.employeeService.updateEmployee(this.editingEmployee.id, formData).subscribe({
          next: () => {
            toast.success('Employee updated successfully');
            this.loadEmployees();
            this.closeEmployeeForm();
          },
          error: (error) => {
            toast.error('Failed to update employee', { description: error.message });
          }
        });
      } else {
        // Create new employee
        this.employeeService.createEmployee(formData).subscribe({
          next: () => {
            toast.success('Employee created successfully');
            this.loadEmployees();
            this.closeEmployeeForm();
          },
          error: (error) => {
            toast.error('Failed to create employee', { description: error.message });
          }
        });
      }
    }
  }
  
  editEmployee(employee: Employee) {
    this.openEmployeeForm(employee);
  }
  
  deleteEmployee(employee: Employee) {
    if (confirm(`Are you sure you want to delete this employee?`)) {
      this.employeeService.deleteEmployee(employee.id).subscribe({
        next: () => {
          this.employees.update(employees => employees.filter(u => u.id !== employee.id));
          toast.success('Employee deleted successfully');
        },
        error: (error) => {
          toast.error('Failed to delete employee', { description: error.message });
        }
      });
    }
  }
  
  ngOnInit() {}
}