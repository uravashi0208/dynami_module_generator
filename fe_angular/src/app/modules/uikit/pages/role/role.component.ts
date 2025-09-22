import { Component, computed, OnInit, signal,EventEmitter, Output  } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { toast } from 'ngx-sonner';
import { TableFooterComponent } from '../table/components/table-footer/table-footer.component';
import { Role } from '../table/model/role.model';
import { TableFilterService } from '../table/services/table-filter.service';
import { RoleService } from '../../../../core/services/role.service';

@Component({
  selector: 'app-role',
  imports: [
    AngularSvgIconModule,
    FormsModule,
    TableFooterComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './role.component.html',
  styleUrl: './role.component.css',
})
export class RoleComponent implements OnInit {
  roles = signal<Role[]>([]);
  @Output() onCheck = new EventEmitter<boolean>();
  showRoleForm = false;
  editingRole: Role | null = null;
  roleForm!: FormGroup;
  protected readonly toast = toast;

  currentPage = signal(1);
  itemsPerPage = signal(5);
  totalItems = computed(() => this.filteredRoles().length);

  constructor(private roleService: RoleService, private filterService: TableFilterService,private readonly _formBuilder: FormBuilder) {
    this.roleForm = this._formBuilder.group({
      name: ['', Validators.required],
      isActive: [true]
    });

    this.loadRoles();
  }

  private loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (data) => {
        // Transform the roles to include table-specific fields
        const rolesWithTableFields = data.map(role => ({
           ...role,
          selected: false,
          createdAt: role.createdAt || new Date().toISOString(), // Add if missing
          isActive: role.isActive !== undefined ? role.isActive : true // Default to true
        }));
        this.roles.set(rolesWithTableFields);
      },
      error: (error) => {
        this.handleRequestError(error);
      },
    });
  }

  public toggleRoles(checked: boolean) {
    this.roles.update((roles) => {
      return roles.map((role) => {
        return { ...role, selected: checked };
      });
    });
  }

  private handleRequestError(error: any) {
    const msg = 'An error occurred while fetching roles.';
    toast.error(msg, {
      position: 'bottom-right',
      description: error.message,
      action: {
        label: 'Retry',
        onClick: () => this.loadRoles(),
      },
      actionButtonStyle: 'background-color:#DC2626; color:white;',
    });
  }

  filteredRoles = computed(() => {
    const search = this.filterService.searchField().toLowerCase();
    const status = this.filterService.statusField();
    const order = this.filterService.orderField();

    return this.roles()
      .filter(
        (role) =>
          role.name.toLowerCase().includes(search) ||
          role.id.toLowerCase().includes(search),
      )
      .filter((role) => {
        if (!status) return true;
        // For roles, we'll filter by isActive status
        switch (status) {
          case '1':
            return role.isActive === true;
          case '2':
            return role.isActive === false;
          default:
            return true;
        }
      })
      .sort((a, b) => {
        const defaultNewest = !order || order === '1';
        if (defaultNewest) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (order === '2') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return 0;
      });
  });

  paginatedRoles = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.filteredRoles().slice(startIndex, endIndex);
  });

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number): void {
    this.itemsPerPage.set(size);
    this.currentPage.set(1); // Reset to first page
  }

  onSearchChange(value: Event) {
    const input = value.target as HTMLInputElement;
    this.filterService.searchField.set(input.value);
  }

  onOrderChange(value: Event) {
    const selectElement = value.target as HTMLSelectElement;
    this.filterService.orderField.set(selectElement.value);
  }
  public toggle(event: Event) {
    const value = (event.target as HTMLInputElement).checked;
    this.toggleRoles(value);
    this.onCheck.emit(value); 
  }



  // Role form methods
  openRoleForm(role?: Role) {
    if (role) {
      this.editingRole = role;
      this.roleForm.patchValue({
        name: role.name,
        isActive: role.isActive
      });
    } else {
      this.editingRole = null;
      this.roleForm.reset({ isActive: true });
    }
    this.showRoleForm = true
  }
  
  closeRoleForm() {
    this.showRoleForm = false
    this.roleForm.reset({ isActive: true });
    this.editingRole = null;
  }
  
  saveRole() {
    if (this.roleForm.valid) {
      const formData = this.roleForm.value;
      
      if (this.editingRole) {
        // Update existing role
        const updatedRole = { ...this.editingRole, ...formData };
        this.roleService.updateRole(updatedRole).subscribe({
          next: () => {
            this.roles.update(roles => 
              roles.map(role => role.id === updatedRole.id ? updatedRole : role)
            );
            toast.success('Role updated successfully');
            this.closeRoleForm();
          },
          error: (error) => {
            toast.error('Failed to update role', { description: error.message });
          }
        });
      } else {
        // Create new role
        this.roleService.createRole(
        formData.name, 
        formData.isActive
      ).subscribe({
        next: (newRole) => {
          toast.success('Role created successfully');
          this.loadRoles();
          this.closeRoleForm();
        },
        error: (error) => {
          toast.error('Failed to create role', { description: error.message });
        }
      });
      }
    }
  }
  
  editRole(role: Role) {
    this.openRoleForm(role);
  }
  
  deleteRole(role: Role) {
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      this.roleService.deleteRole(role.id).subscribe({
        next: () => {
          this.roles.update(roles => roles.filter(r => r.id !== role.id));
          toast.success('Role deleted successfully');
        },
        error: (error) => {
          toast.error('Failed to delete role', { description: error.message });
        }
      });
    }
  }
  
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
  
  ngOnInit() {}
}
