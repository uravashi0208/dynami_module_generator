import { Component, computed, OnInit, signal, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { toast } from 'ngx-sonner';
import { TableFooterComponent } from '../table/components/table-footer/table-footer.component';
import { UserService, User } from 'src/app/core/services/user.service';
import { TableFilterService } from '../table/services/table-filter.service';
import { RoleService } from 'src/app/core/services/role.service';

@Component({
  selector: 'app-user',
  imports: [
    AngularSvgIconModule,
    FormsModule,
    TableFooterComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent implements OnInit {
  users = signal<User[]>([]);
  roles = signal<any[]>([]);
  @Output() onCheck = new EventEmitter<boolean>();
  showUserForm = false;
  editingUser: User | null = null;
  userForm!: FormGroup;
  protected readonly toast = toast;

  // Pagination properties
  currentPage = signal(1);
  itemsPerPage = signal(5);
  totalItems = computed(() => this.filteredUsers().length);

  constructor(
    private userService: UserService, 
    private roleService: RoleService,
    private filterService: TableFilterService,
    private readonly _formBuilder: FormBuilder
  ) {
    this.userForm = this._formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      roleIds: [[]],
      isActive: [true]
    });

    this.loadUsers();
    this.loadRoles();
  }

  private loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: ({ data }) => {
        const usersWithTableFields = data.users.map((user: User) => ({
          ...user,
          selected: false,
          name: `${user.first_name} ${user.last_name}`,
          createdAt: user.createdAt || new Date().toISOString(),
          isActive: user.isActive !== undefined ? user.isActive : true
        }));
        this.users.set(usersWithTableFields);
      },
      error: (error) => {
        this.handleRequestError(error, 'users');
      },
    });
  }

  private loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (data) => {
        const rolesWithTableFields = data.map(role => ({
           ...role,
        }));
        this.roles.set(rolesWithTableFields);
      },
      error: (error) => {
        this.handleRequestError(error, 'roles');
      },
    });
  }

  public toggleUsers(checked: boolean) {
    this.users.update((users) => {
      return users.map((user) => {
        return { ...user, selected: checked };
      });
    });
  }

  private handleRequestError(error: any, entity: string) {
    const msg = `An error occurred while fetching ${entity}.`;
    toast.error(msg, {
      position: 'bottom-right',
      description: error.message,
      action: {
        label: 'Retry',
        onClick: () => entity === 'users' ? this.loadUsers() : this.loadRoles(),
      },
      actionButtonStyle: 'background-color:#DC2626; color:white;',
    });
  }

  filteredUsers = computed(() => {
    const search = this.filterService.searchField().toLowerCase();
    const status = this.filterService.statusField();
    const order = this.filterService.orderField();

    return this.users()
      .filter(
        (user) =>
          user.first_name.toLowerCase().includes(search) ||
          user.last_name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.id.toLowerCase().includes(search),
      )
      .filter((user) => {
        if (!status) return true;
        switch (status) {
          case '1':
            return user.isActive === true;
          case '2':
            return user.isActive === false;
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

  // Get paginated users
  paginatedUsers = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.filteredUsers().slice(startIndex, endIndex);
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
    this.toggleUsers(value);
    this.onCheck.emit(value); 
  }

  // User form methods
  openUserForm(user?: User) {
    if (user) {
      this.editingUser = user;
      this.userForm.patchValue({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        roleIds: user.roles.map(role => role.id),
        isActive: user.isActive
      });
      this.userForm.get('password')?.clearValidators();
    } else {
      this.editingUser = null;
      this.userForm.reset({ isActive: true });
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.userForm.get('password')?.updateValueAndValidity();
    this.showUserForm = true;
  }
  
  closeUserForm() {
    this.showUserForm = false;
    this.userForm.reset({ isActive: true });
    this.editingUser = null;
  }
  
  saveUser() {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      
      if (this.editingUser) {
        // Update existing user
        const updatedUser = { 
          ...this.editingUser, 
          ...formData,
          name: `${formData.first_name} ${formData.last_name}`
        };
        
        this.userService.updateUser(updatedUser).subscribe({
          next: () => {
            this.users.update(users => 
              users.map(user => user.id === updatedUser.id ? updatedUser : user)
            );
            toast.success('User updated successfully');
            this.closeUserForm();
          },
          error: (error) => {
            toast.error('Failed to update user', { description: error.message });
          }
        });
      } else {
        // Create new user
        this.userService.createUser(
          formData.first_name,
          formData.last_name,
          formData.email,
          formData.password,
          formData.roleIds,
          formData.isActive
        ).subscribe({
          next: () => {
            toast.success('User created successfully');
            this.loadUsers();
            this.closeUserForm();
          },
          error: (error) => {
            toast.error('Failed to create user', { description: error.message });
          }
        });
      }
    }
  }
  
  editUser(user: User) {
    this.openUserForm(user);
  }
  
  deleteUser(user: User) {
    if (confirm(`Are you sure you want to delete the user "${user.first_name} ${user.last_name}"?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users.update(users => users.filter(u => u.id !== user.id));
          toast.success('User deleted successfully');
        },
        error: (error) => {
          toast.error('Failed to delete user', { description: error.message });
        }
      });
    }
  }
  
  ngOnInit() {}
}