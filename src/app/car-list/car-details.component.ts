import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CarService } from './car.service';
import { Car } from './interfaces/car.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { IoConnectService } from '../interop/ioConnect.service';

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
      
    constructor(private _carService: CarService,
                private _ioConnectService: IoConnectService) { };

    public ngOnInit(): void {
        //this.loadCars();
        this.registerSyncCarsMethod();
    }

    public registerSyncCarsMethod(): void {
        const methodName = 'DEMO.SyncCars';
        const methodHandler = ({ id }: { id: string }) => {
            this.getCar(id);
        };

        this._ioConnectService.ioConnectStore.getIOConnect().interop.register(methodName, methodHandler);
    }

    // Id comes from interop method
    public getCar(id: string) {
        //Reset the car and error signals
        this.car.set(null);
        this.error.set(null);

        console.log("Car ID from INTEROP METHOD: ", id);
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
}