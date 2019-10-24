import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { Hero } from '../hero';
import { HeroService } from '../hero.service';

declare var fin;

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css']
})

export class HeroesComponent implements OnInit {
  heroes: Hero[];
  msgFromDashboard: any = 'hello2';
  temp: string = 'hello';

  constructor(private heroService: HeroService, private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.getHeroes();
    var onSuccess = () => { console.log('subscribed successfully', this.msgFromDashboard); }
    var onFail = () => { console.log('failed to subscribe', this.msgFromDashboard); }

    fin.desktop.InterApplicationBus.subscribe('*', 'TOPIC_APP_TO_APP', (msg, uuid) => {
      console.log(msg);
      this.msgFromDashboard = msg.message;
      this.ref.detectChanges();
    }, onSuccess, onFail);
  }

  getHeroes(): void {
    this.heroService.getHeroes()
      .subscribe(heroes => this.heroes = heroes);
  }

  add(name: string): void {
    name = name.trim();
    if (!name) { return; }
    this.heroService.addHero({ name } as Hero)
      .subscribe(hero => {
        this.heroes.push(hero);
      });
  }

  delete(hero: Hero): void {
    this.heroes = this.heroes.filter(h => h !== hero);
    this.heroService.deleteHero(hero).subscribe();
  }

  msgListener(msg, uuid) {
    console.log('msg', msg)
    this.msgFromDashboard = JSON.stringify(msg);
    console.log(`Received from ${uuid}: ${this.msgFromDashboard}`);
  }

  sendToDashboard(msg: string) {
    console.log(`Sending to dashboard: ${msg}`);

    var successCallback = function (e) {
      console.log("SUCCESSFULLY SENT APP TO APP");
    };
    var errorCallback = function (e) {
      console.log("ERROR MESSAGE APP TO APP", e);
    };

    var parentUuid;
    var application = fin.desktop.Application.getCurrent();
    application.getParentUuid(function (pUuid) {
      parentUuid = pUuid;
      console.log(parentUuid);
      fin.desktop.InterApplicationBus.send(parentUuid, 'TOPIC_APP_TO_APP', { message: msg }, successCallback, errorCallback);
    });

  }

  changeTemp(t) {
    console.log(this.msgFromDashboard);
    this.msgFromDashboard = t;
  }








}
