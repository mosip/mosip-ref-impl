import { Component, OnInit } from "@angular/core";
import { DataStorageService } from "../services/data-storage.service";
@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.css"],
})
export class FooterComponent implements OnInit {
  appVersion: string;
  constructor(private dataService: DataStorageService) {}

  ngOnInit() {
    this.dataService.getConfig().subscribe(res => {
      this.appVersion = res['response']['preregistration.ui.version'];
    });
  }
}
