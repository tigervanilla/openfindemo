import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Hero } from '../hero';
import { HeroService } from '../hero.service';

declare var fin;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  msgFromChild:string;
  heroes: Hero[] = [];

  constructor(private heroService: HeroService, private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.getHeroes();

    var onSuccess = () => { console.log('subscribed successfully to child'); }
    var onFail = () => { console.log('failed to subscribe to child'); }

    fin.desktop.InterApplicationBus.subscribe('*', 'TOPIC_APP_TO_APP', (msg, uuid) => {
      console.log(msg);
      this.msgFromChild = msg.message;
      this.ref.detectChanges();
    }, onSuccess, onFail);
  }

  getHeroes(): void {
    this.heroService.getHeroes()
      .subscribe(heroes => this.heroes = heroes.slice(1, 5));
  }

  notify() {
    var callback = function (message) {
      document.getElementById("noti-callback-msg").innerText = message;
    };
    fin.desktop.InterApplicationBus.subscribe("*", "notification-callback", callback);
    var notification = new fin.desktop.Notification({
      url: "http://localhost:4200/heroes/detail/15",
      message: "This is a notification message",
      onMessage: callback
    });
  }

  childWindow() {
    var app = new fin.desktop.Application({
      url: "http://localhost:4200/heroes",
      uuid: "uuid-foo-88",
      applicationIcon: "Medium",
      name: "Medium",
      mainWindowOptions: {
        defaultHeight: 600,
        defaultWidth: 400,
        defaultTop: 300,
        defaultLeft: 300,
        autoShow: true
      }
    }, () => {
      console.log("Application successfully created");
      app.run();


    }, () => {
      console.log("Error creating application");
    });
  }

  sendMsg(msg: string) {
    console.log(`Sending ${msg}`);

    var successCallback = function (e) {
      console.log("SUCCESSFULLY SENT APP TO APP");
    };
    var errorCallback = function (e) {
      console.log("ERROR MESSAGE APP TO APP", e);
    };

    fin.desktop.InterApplicationBus.send('uuid-foo-88', 'TOPIC_APP_TO_APP', { message: msg }, successCallback, errorCallback);
  }
}
