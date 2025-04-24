import { Component, OnInit, signal } from '@angular/core';
import { CarService } from './car.service';
import { Car } from './interfaces/car.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { IoConnectService } from '../interop/ioConnect.service';
import { IOConnectWorkspaces } from '@interopio/workspaces-api';

@Component({
  selector: 'car-deatils',
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './car-details.component.html',
  styleUrl: './car-details.component.scss'
})
export class CarDetailsComponent implements OnInit {
    public carId = signal<string>('');
    public car = signal<Car | null>(null);
    public error = signal<string | null>(null);
    public workspaces = signal<IOConnectWorkspaces.API | undefined>(undefined);
    public currentWorkspace = signal<IOConnectWorkspaces.Workspace | undefined>(undefined);


    public displayedColumns = ['make', 'model', 'type', 'publisher', 'actions'];
      
    constructor(private _carService: CarService,
                private _ioConnectService: IoConnectService) { };

    public ngOnInit(): void {
        //this.loadCars();
        this.registerSyncCarsMethod();
        this.registerIntents();
        this.getWorkspaces();
        this.subscribeToPriceStream();
    }

    public registerMethods(): void {
        this.registerSyncCarsMethod()
        // add other methods when needed
    }

    public registerIntents(): void {
        this.registerShowCarsIntent()
        // add other intents when needed
    }

    private registerShowCarsIntent(): void {
        const intentName = 'DEMO.ShowCarDetails';
        const intentHandler = (context: any) => {
            console.log("Intent triggered from angular");
            console.log(context);

            this.getCar(context.data.id);
        };

        console.log("Registering intent: ", intentName);
        this._ioConnectService
            .getIoConnect()
            .intents
            .addIntentListener(intentName, intentHandler);
    }

    public registerSyncCarsMethod(): void {
        const methodName = 'DEMO.SyncCars';
        const methodHandler = ({ id }: { id: string }) => {
            this.getCar(id);
        };

        this._ioConnectService
            .getIoConnect()
            .interop
            .register(methodName, methodHandler);
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

    private getWorkspaces(): void {
        const workspaces = this._ioConnectService.getIoConnectWorkspaces();
        if (workspaces) {
            this.workspaces.set(workspaces);

            workspaces.inWorkspace().then((workspace: any) => {
                workspaces.getMyWorkspace().then((workspace: any) => {
                    console.log("Current workspace:", workspace);
                    this.currentWorkspace.set(workspace);
                    
                    this.handleInitialWorkspaceContext();
                    this.subscribeToContextChanges();
                });
            }).catch((error: any) => {
                console.error("Error getting current workspace:", error);
            });
        } else {
            console.error("Workspaces API is not available.");
        }
    }

    private handleInitialWorkspaceContext(): void {
        this.currentWorkspace()
            ?.getContext()
            .then((context: any) => {
                console.log("Initial workspace context:", context);
                if (context.type === "CAR") {
                    this.carId.set(context.data.id);
                } else {
                    this.carId.set("");
                }

                this.getCar(this.carId());
            });
    }

    private subscribeToContextChanges(): void {
        this.currentWorkspace()
            ?.onContextUpdated((context: any) => {
                console.log("Workspace context changed:", context);
                if (context.type === "CAR") {
                    this.carId.set(context.data.id);
                } else {
                    this.carId.set("");
                }

                this.getCar(this.carId());
            });
    }

    private subscribeToPriceStream(): void {
        this._ioConnectService
            .getIoConnect()
            .interop
            .subscribe('Demo.LastTradesStream')
            .then((subscription) => {
                subscription.onData((carData) => {
                    console.log("Price stream data:", carData.data);
                    console.log(this.car());
                    if (this.car()?.make === carData.data.carMake) {
                        console.log("MATCH");
                        this.car.update(prevCar => {
                            if (prevCar) {
                                    const element: any = document.querySelector('.price');

                                    if (element) {
                                        const origStyle = element.style;
    
                                        element.style.color = 'white';
    
                                        if (prevCar.price > carData.data.lastPrice) {
                                            element.style.backgroundColor = 'red';
                                        } else {
                                            element.style.backgroundColor = 'green';
                                        }
    
                                        setTimeout(() => {
                                            element.style = origStyle;
                                        }, 1000); // 1 second
                                    }

                                    return { ...prevCar, price: carData.data.lastPrice };
                                }

                            return prevCar;
                        });
                }
                });
            })
    }
}