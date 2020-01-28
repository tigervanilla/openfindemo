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

  // Applications are independent of parent
  // Stays active even if parent is closed
  createApplication() {
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
      // setTimeout(() => app.close(),2000);
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

  async createViewHelper() {
    const me = await fin.Window.getCurrent();
    return fin.View.create({
        name: `View-${Date.now()}`, 
        target: me.identity, 
        bounds: {top: 10, left: 10, width: 200, height: 200} 
    });
  }

  // Views are embedded INSIDE the parent
  // Gets closed with the parent
  createView() {
    this.createViewHelper().then(createdView => {
      const view = createdView;
      console.log('View created', view);
      view.navigate('https://duckduckgo.com');
      console.log('View navigated to duckduckgo');
    }).catch(err => console.log(err));
  }

  // Windows are dependent on the parent
  // Gets closed with the parent
  createWindow() {
    const winOptions = {
      name: `Window-${Date.now()}`,
      defaultWidth: 300,
      defaultHeight: 300,
      url: 'https://duckduckgo.com',
      frame: true,
      autoShow: true
    };
    fin.Window.create(winOptions).then(() => console.log('window created')).catch(err => console.log(err));
  }

  navigateWindow(newUrl: string) {
    const application = fin.desktop.Application.getCurrent();
    application.getChildWindows(function (children) {
      children.forEach(function (childWindow) {
          console.log("Showing child: " + childWindow.name);
          childWindow.navigate(newUrl);
      });
  });
  }
}
