import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientVendor } from 'src/app/common/client-vendor';
import { Invoice } from 'src/app/common/invoice';
import { InvoiceProduct } from 'src/app/common/invoice-product';
import { ClientVendorService } from 'src/app/services/client-vendor.service';
import { InvoiceService } from 'src/app/services/invoice.service';

@Component({
  selector: 'app-purchase-invoice-create',
  templateUrl: './invoice-create.component.html',
  styleUrls: ['./invoice-create.component.css']
})
export class InvoiceCreateComponent implements OnInit{
  invoiceForm!: FormGroup;
  clientVendors: ClientVendor[] = [];
  invProducts: InvoiceProduct[] = [];
  id: number | undefined;
  type: string = '';

  constructor(private invoiceService: InvoiceService,
              private formBuilder: FormBuilder,
              private clientService: ClientVendorService,
              private router: Router,
              private route: ActivatedRoute){}

  ngOnInit(): void {
    this.type = this.route.snapshot.paramMap.get('type')!;
    this.invoiceForm = this.formBuilder.group({
      invoiceNo: new FormControl('',[Validators.required,Validators.minLength(2)]),
      date: new FormControl('',[Validators.required]),
      clientVendor: new FormControl('',[Validators.required])
    });

    this.clientService.fetchClientVendors();
    this.clientService.getClientVendors().subscribe(
      response => this.clientVendors = response
    );

    this.invoiceService.createInvoice(new Invoice(), this.type).subscribe(
      response =>  {
        this.invoiceForm.patchValue(response);
        this.id = response.id;
      }
    )
  }

  onSubmit(){
    const invoice: Invoice = this.invoiceForm.value as Invoice;
    invoice.invoiceProducts = [];
    this.invProducts.forEach(
      iProduct => this.invoiceService.createInvoiceProducts(this.id!, iProduct).subscribe(
        data => invoice.invoiceProducts?.push(data)
      )
    );
    this.invoiceService.updateInvoice(invoice, this.id!).subscribe(
      data => this.invoiceService.updateInvoices(data)
    );
    this.router.navigate(['/pinvoice-list', this.type]);
  }

  addInvoiceProduct(iProducts: InvoiceProduct[]){
    this.invProducts = iProducts;
  }

}
