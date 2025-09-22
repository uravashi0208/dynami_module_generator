import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-table-footer',
  imports: [AngularSvgIconModule, CommonModule],
  templateUrl: './table-footer.component.html',
  styleUrl: './table-footer.component.css',
})
export class TableFooterComponent {
 @Input() currentPage: number = 1;
  @Input() itemsPerPage: number = 5; // Change from 10 to 5
  @Input() totalItems: number = 0;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 30, 50];
  
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.totalItems ? this.totalItems : end;
  }

  get pages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  const size = parseInt(target.value, 10);
  this.pageSizeChange.emit(size);
  // Reset to first page when page size changes
  this.pageChange.emit(1);
}

  isEllipsisVisible(position: 'start' | 'end'): boolean {
    if (position === 'start') {
      return this.pages.length > 0 && this.pages[0] > 1;
    } else {
      return this.pages.length > 0 && this.pages[this.pages.length - 1] < this.totalPages;
    }
  }
}