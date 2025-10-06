import { Component, computed, OnInit, signal, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { toast } from 'ngx-sonner';
import { TableFooterComponent } from '../table/components/table-footer/table-footer.component';
import { ModuleService, Module, Field } from 'src/app/core/services/module.service';
import { TableFilterService } from '../table/services/table-filter.service';
import { DatePipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-module',
  imports: [
    AngularSvgIconModule,
    FormsModule,
    TableFooterComponent,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './module.component.html',
  styleUrl: './module.component.css',
  providers: [DatePipe]
})
export class ModuleComponent implements OnInit {
  modules = signal<Module[]>([]);
  @Output() onCheck = new EventEmitter<boolean>();
  showModuleForm = false;
  loading = false;
  editingModule: Module | null = null;
  moduleForm!: FormGroup;
  fieldTypes = ['String', 'Number', 'Boolean', 'Date', 'Array', 'ObjectId'];
  protected readonly toast = toast;

  // Pagination properties
  currentPage = signal(1);
  itemsPerPage = signal(5);
  totalItems = computed(() => this.filteredModules().length);


  formatDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'medium') || dateString;
  }
  constructor(
    private moduleService: ModuleService, 
    private filterService: TableFilterService,
    private readonly _formBuilder: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.moduleForm = this._formBuilder.group({
      name: ['', [Validators.required, Validators.pattern('^[A-Z][a-zA-Z0-9]*$')]],
      fields: this._formBuilder.array([])
    });

    this.loadModules();
  }

  get fields(): FormArray {
    return this.moduleForm.get('fields') as FormArray;
  }

  createField(field?: Field): FormGroup {
    return this._formBuilder.group({
      name: [field?.name || '', [Validators.required, Validators.pattern('^[a-z][a-zA-Z0-9]*$')]],
      label: [field?.label || '', Validators.required],
      dataType: [field?.dataType || 'String', Validators.required],
      isRequired: [field?.isRequired || false],
      isUnique: [field?.isUnique || false],
      ref: [field?.ref || '']
    });
  }

  addField(field?: Field): void {
    this.fields.push(this.createField(field));
  }

  removeField(index: number): void {
    this.fields.removeAt(index);
  }

  private loadModules(): void {
    this.moduleService.getModules().subscribe({
      next: ({ data }) => {
        this.modules.set(data.modules);
      },
      error: (error) => {
        this.handleRequestError(error, 'modules');
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
        onClick: () => this.loadModules(),
      },
      actionButtonStyle: 'background-color:#DC2626; color:white;',
    });
  }

  filteredModules = computed(() => {
    const search = this.filterService.searchField().toLowerCase();
    
    return this.modules()
      .filter(
        (module) =>
          module.name.toLowerCase().includes(search) ||
          module.id.toLowerCase().includes(search),
      );
  });

  // Get paginated modules
  paginatedModules = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.filteredModules().slice(startIndex, endIndex);
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

  public toggle(event: Event) {
    const value = (event.target as HTMLInputElement).checked;
    this.onCheck.emit(value); 
  }

  // Module form methods
  openModuleForm(module?: Module) {
    if (module) {
      this.editingModule = module;
      this.moduleForm.patchValue({
        name: module.name
      });
      
      // Clear existing fields
      while (this.fields.length !== 0) {
        this.fields.removeAt(0);
      }
      
      // Add fields from module
      module.fields.forEach(field => {
        this.addField(field);
      });
    } else {
      this.editingModule = null;
      this.moduleForm.reset();
      // Clear fields
      while (this.fields.length !== 0) {
        this.fields.removeAt(0);
      }
      // Add one empty field
      this.addField();
    }
    this.showModuleForm = true;
  }
  
  closeModuleForm() {
    this.showModuleForm = false;
    this.moduleForm.reset();
    this.editingModule = null;
    // Clear fields
    while (this.fields.length !== 0) {
      this.fields.removeAt(0);
    }
  }
  
  saveModule() {
    this.loading = true;
    if (this.moduleForm.valid) {
      const formData = this.moduleForm.value;
      
      if (this.editingModule) {
        // Update existing module
        this.moduleService.updateModule(this.editingModule.name, formData.fields).subscribe({
          next: () => {
            this.loading = false;
            toast.success('Module updated successfully');
            this.loadModules();
            this.closeModuleForm();
          },
          error: (error) => {
            this.loading = false;
            toast.error('Failed to update module', { description: error.message });
          }
        });
      } else {
        // Create new module
        this.moduleService.createModule(formData.name, formData.fields).subscribe({
          next: () => {
            this.loading = false;
            toast.success('Module created successfully');
            this.loadModules();
            this.closeModuleForm();
          },
          error: (error) => {
            this.loading = false;
            console.log("error :",error);
            
            toast.error('Failed to create module', { description: error.message });
          }
        });
      }
    }
  }
  
  deleteModule(module: Module) {
    if (confirm(`Are you sure you want to delete the module "${module.name}"? This will also delete all generated files.`)) {
      this.moduleService.deleteModule(module.name).subscribe({
        next: () => {
          this.modules.update(modules => modules.filter(m => m.id !== module.id));
          toast.success('Module deleted successfully');
        },
        error: (error) => {
          toast.error('Failed to delete module', { description: error.message });
        }
      });
    }
  }
  
  ngOnInit() {}
}