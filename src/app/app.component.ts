import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CarDetailsComponent } from "./car-list/car-details.component";
import { IoConnectService } from './interop/ioConnect.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CarDetailsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Car Details App';

  constructor(private _ioConnectService: IoConnectService) { };

  public ngOnInit(): void {
    if (!this._ioConnectService.ioConnectStore.getInitError()) {
      const ioConnect = this._ioConnectService.ioConnectStore.getIOConnect();
      ;(window as any).ioConnect = ioConnect; // Expose ioConnect to the global scope for debugging

      console.log("Success: Running ioConnect version: " + ioConnect.version);
      console.log(typeof(ioConnect));
    } else {
      console.error("Error initializing IOConnect:", this._ioConnectService.ioConnectStore.getInitError());
    }
  }
}
