import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CarService } from './car.service';
import { Car } from './interfaces/car.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'car-deatils',
  imports: [RouterOutlet, CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './car-details.component.html',
  styleUrl: './car-details.component.scss'
})
export class CarDetailsComponent implements OnInit {
    public carId = signal<string>('');
    public car = signal<Car | null>(null);
    public error = signal<string | null>(null);

    public displayedColumns = ['make', 'model', 'type', 'publisher', 'actions'];
      
    constructor(private _carService: CarService) { };

    public ngOnInit(): void {
        //this.loadCars();
    }

    public getCar() {
        const id = this.carId().trim();
        console.log("Car ID: ", id);
        if (!id) {
          this.error.set('Please enter a valid car ID');
          return;
        }
    
        this._carService.getCarById(id).subscribe({
          next: (data) => {
            this.car.set(data);
            this.error.set(null);
          },
          error: () => {
            this.error.set('Car not found or invalid ID');
            this.car.set(null);
          }
        });
      }

    public updateCar(id: string): void {
        alert("Update car functionality is not implemented yet.");
    }

    public deleteCar(id: string): void {
        this._carService.deleteCar(id).subscribe(() => {
            this.car.set(null);
        });
    }

    public onCarIdChange(event: any) {
        console.log("input change");
        console.log(event.target.value);
        this.carId.set(event.target.value);
    }
}