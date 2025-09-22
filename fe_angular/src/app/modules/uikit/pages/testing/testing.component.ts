import { Component, computed, OnInit, signal, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { toast } from 'ngx-sonner';
import { TableFooterComponent } from '../table/components/table-footer/table-footer.component';
import { TestingService, Testing } from 'src/app/core/services/testing.service';
import { TableFilterService } from '../table/services/table-filter.service';

@Component({
  selector: 'app-testing',
  imports: [
    AngularSvgIconModule,
    FormsModule,
    TableFooterComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './testing.component.html',
  styleUrl: './testing.component.css',
})
export class TestingComponent implements OnInit {
  testings = signal<Testing[]>([]);
  @Output() onCheck = new EventEmitter<boolean>();
  showTestingForm = false;
  editingTesting: Testing | null = null;
  testingForm!: FormGroup;
  protected readonly toast = toast;

  // Pagination properties
  currentPage = signal(1);
  itemsPerPage = signal(5);
  totalItems = computed(() => this.filteredTestings().length);

  constructor(
    private testingService: TestingService, 
    private filterService: TableFilterService,
    private readonly _formBuilder: FormBuilder
  ) {
    this.testingForm = this._formBuilder.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required]
    });

    this.loadTestings();
  }

  private loadTestings(): void {
    this.testingService.getTestings().subscribe({
      next: ({ data }) => {
        this.testings.set(data.testings);
      },
      error: (error) => {
        this.handleRequestError(error, 'testings');
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
        onClick: () => this.loadTestings(),
      },
      actionButtonStyle: 'background-color:#DC2626; color:white;',
    });
  }

  filteredTestings = computed(() => {
    const search = this.filterService.searchField().toLowerCase();
    
    return this.testings()
      .filter((testing) =>
        testing.name?.toString().toLowerCase().includes(search) ||
        testing.lastname?.toString().toLowerCase().includes(search)
      );
  });

  // Get paginated testings
  paginatedTestings = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage();
    const endIndex = startIndex + this.itemsPerPage();
    return this.filteredTestings().slice(startIndex, endIndex);
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

  // Testing form methods
  openTestingForm(testing?: Testing) {
    if (testing) {
      this.editingTesting = testing;
      this.testingForm.patchValue({
        name: testing.name,
        lastname: testing.lastname
      });
    } else {
      this.editingTesting = null;
      this.testingForm.reset();
    }
    this.showTestingForm = true;
  }
  
  closeTestingForm() {
    this.showTestingForm = false;
    this.testingForm.reset();
    this.editingTesting = null;
  }
  
  saveTesting() {
    if (this.testingForm.valid) {
      const formData = this.testingForm.value;
      
      if (this.editingTesting) {
        // Update existing testing
        this.testingService.updateTesting(this.editingTesting.id, formData).subscribe({
          next: () => {
            toast.success('Testing updated successfully');
            this.loadTestings();
            this.closeTestingForm();
          },
          error: (error) => {
            toast.error('Failed to update testing', { description: error.message });
          }
        });
      } else {
        // Create new testing
        this.testingService.createTesting(formData).subscribe({
          next: () => {
            toast.success('Testing created successfully');
            this.loadTestings();
            this.closeTestingForm();
          },
          error: (error) => {
            toast.error('Failed to create testing', { description: error.message });
          }
        });
      }
    }
  }
  
  editTesting(testing: Testing) {
    this.openTestingForm(testing);
  }
  
  deleteTesting(testing: Testing) {
    if (confirm(`Are you sure you want to delete this testing?`)) {
      this.testingService.deleteTesting(testing.id).subscribe({
        next: () => {
          this.testings.update(testings => testings.filter(u => u.id !== testing.id));
          toast.success('Testing deleted successfully');
        },
        error: (error) => {
          toast.error('Failed to delete testing', { description: error.message });
        }
      });
    }
  }
  
  ngOnInit() {}
}