var gameLayer;

var GameMainScene = cc.Scene.extend({
    onEnter: function () {
        this._super();
        gameLayer = new GameMainLayer();
        this.addChild(gameLayer);
    }
});


var GameMainLayer = cc.Layer.extend({
    //sprite:null,
    //コンストラクタ
    ctor: function () {
        this._super();
        cc.audioEngine.playMusic(res.bgm_main, true);
        //var backgroundLayer = new cc.LayerColor(cc.color(170, 202, 222, 255));
        //this.addChild(backgroundLayer);
        var back_img = new cc.Sprite(res.img_back);
        back_img.attr({
            x: cc.winSize.width / 2,
            y: cc.winSize.height / 2
        });

        this.addChild(back_img, 0);

        this.effectCircleList = [];
        this.player = new Player();
        this.addChild(this.player, 0);
        this.time = 0;
        this.time2 = 0;
        this.cycle = 1200;
        this.fallSpeed = 5;
        this.fallCycle = 180;
        this.hardLineList = [false, false, false, false, false];
        this.hardLineList[Math.floor(Math.random() * 5)] = true;
        //this.hardLineList.push(Math.floor(Math.random() * 5));
        this.hardStartTime = this.cycle - 10;
        this.hardEndTime = this.cycle;
        this.isDead = false;
        this.isHard = true;//trueなら警告通りにenemyが飛んでくる
        //this.warnBox = new cc.Sprite(res.img_warn);
        //this.addChild(this.warnBox, 2);
        //this.warnBox.runAction(new cc.fadeOut(0));
        //本当は外で定義したい
        var listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();

                target.player.changeTargetX(touch.getLocation().x);//ここなんでtargetなんだろう
                //書いてあった↓
                //http://mmorley.hatenablog.com/entry/2015/09/22/230549
                target.addEffectCircle(touch.getLocation());
                return true;
            }
        });
        // var touchEffectCircle = ;
        // this.addChild(fillCircle);
        cc.eventManager.addListener(listener.clone(), this);

        //this.scoreLabel = cc.LabelTTF.create("", "Arial", 40);
        //this.scoreLabel.setPosition(cc.winSize.width - 120, cc.winSize.height - 90);
        //this.scoreLabel.setColor(cc.color(0, 0, 0));

        this.resultLabel = cc.LabelTTF.create("スコア:", "Arial", 80);
        this.resultLabel.setPosition(cc.winSize.width / 2, cc.winSize.height / 2 + 100);
        this.resultLabel.setColor(cc.color(255, 0, 0));
        this.resultLabel2 = cc.LabelTTF.create("ゲームオーバー", "Arial", 60);
        this.resultLabel2.setPosition(cc.winSize.width / 2, cc.winSize.height / 2 + 190);
        this.resultLabel2.setColor(cc.color(255, 0, 0));


        this.HPLabel = cc.LabelTTF.create("", "Arial", 40);
        this.HPLabel.setPosition(cc.winSize.width - 120, cc.winSize.height - 50);
        this.HPLabel.setColor(cc.color(0, 0, 0));
        this.heartList = [];
        this.enemyList = [];
        //this.addChild(this.scoreLabel, 1);
        this.addChild(this.HPLabel, 1);

        this.scheduleUpdate();

        //this.schedule(this.addHeart, 3);
        //this.schedule(this.addEnemy, 7);

    },
    update: function (dt) {
        this.HPLabel.setPosition(this.player.getPosition().x, this.player.getPosition().y + 120);
        if (this.isDead) return;

        //this.player.update();
        //this.scoreLabel.setString("スコア:" + Math.round(this.time / 60));
        this.HPLabel.setString(this.player.getHP());
        //console.log(this.heartList.length);
        if (this.player.getHP() <= 0) {
            //cc.director.runScene(new Result());
            this.resultLabel.setString("スコア:" + Math.round(this.time / 60));
            this.addChild(this.resultLabel, 1);
            this.addChild(this.resultLabel2, 1);
            //this.player.changeIsMove();
            //cc.director.runScene(new Title());
            var retry = new RetryBox();
            this.addChild(retry, 2);

            this.isDead = true;
        }
        for (var i = 0; i < this.heartList.length; i++) {
            this.heartList[i]._update(this.player);
        }
        for (var i = 0; i < this.enemyList.length; i++) {
            this.enemyList[i]._update(this.player);
        }


        if (this.time2 % this.fallCycle == 0) this.normalPhase();

        var preWarn = Math.max(Math.floor(this.hardStartTime - 180 * this.cycle / 1200), 0);
        //console.log(preWarn);
        if (preWarn == this.time2) {
            //forEachがつかえないっぽい
            for (var i = 0; i < 5; i++) {
                if (this.hardLineList[i] != this.isHard) continue;
                var w = this.isHard ? new WarnBox1() : new WarnBox2;
                w.init(i, this.hardStartTime - preWarn);
                this.addChild(w, 2);
            }
        }
        //if (this.time2 == this.hardStartTime)
        //    this.warnBox.runAction(new cc.fadeOut(0));
        if (this.hardStartTime <= this.time2 && this.time2 <= this.hardEndTime)
            for (var i = 0; i < 5; i++) {
                if (!this.hardLineList[i]) continue;
                this.hardPhase(i);
            }

        this.time++;
        this.time2++;
        if (this.time2 > this.cycle) {
            this.endPhase();
        }

    },
    normalPhase: function () {
        var k = Math.floor((Math.random() * 6));
        this.addHeart(k, this.fallSpeed + (Math.random() * 2 - 1));
        for (var i = 0; i < 5; i++) {
            if (i == k) continue;
            var n = Math.floor(Math.random() * 10);
            if (n < 2) this.addHeart(i, this.fallSpeed + (Math.random() * 2 - 0.5));
            else if (7 <= n) this.addEnemy(i, this.fallSpeed + (Math.random() * 2 - 1), Math.floor(Math.random() * 3));

        }
    },
    hardPhase: function (_l) {
        this.addEnemy(_l, 1, 3);
    },
    endPhase: function () {
        this.time2 = 0;
        this.cycle = Math.max(this.cycle - 120, 360);
        this.fallSpeed = Math.max(this.fallSpeed - 0.3, 2.0);
        this.fallCycle = Math.max(this.fallCycle - Math.random() * 30 + 5, 30);
        this.fallCycle = Math.floor(this.fallCycle);
        console.log(this.fallCycle);
        this.isHard = Math.random() < 0.5 ? true : false;

        for (var i = 0; i < 5; i++) {
            this.hardLineList[i] = Math.random() < 0.5 ? true : false;
        }
        this.hardLineList[Math.floor(Math.random() * 5)] = false;
        //this.hardLine = Math.floor(Math.random() * 5);
        //this.warnBox.runAction(new cc.fadeOut(0));
        this.hardStartTime = Math.floor(Math.random() * (this.cycle - 60) + 60);
        this.hardStartTime = Math.max(this.hardStartTime, 0);
        this.hardEndTime = this.hardStartTime + Math.random() * 9 + 2;
        this.hardEndTime = Math.min(this.hardEndTime, this.cycle);
        console.assert(this.hardStartTime != this.hardEndTime);
        //console.log(this.hardStartTime);
        //console.log(this.hardEndTime);
    },
    addHeart: function (_i, _t) {
        var heart = new Heart();
        heart.init(_i, _t);
        this.addChild(heart, 1);
        this.heartList.push(heart);
    },
    addEnemy: function (_i, _t, _type) {
        var enemy = new Enemy();
        enemy.init(_i, _t, _type);
        this.addChild(enemy, 1);
        this.enemyList.push(enemy);
    },
    addEffectCircle: function (_p) {
        //var c = cc.DrawNode();
        // var circle = new cc.DrawNode().drawDot(cc.p(_p.x, _p.y), 50, cc.color(255, 0, 0));
        // this.effectCircleList.push(circle);
        // this.addChild(circle, 2);
        var circle = new EffectCircle();//なんでcc.DrawNode()できないんじゃい
        circle.init(_p.x, _p.y);
        this.addChild(circle, 2);
    },
    preAddHeart: function (_t) {
        for (var i = 0; i < 5; i++) {
            if (Math.floor(Math.random() * 10) < 4) this.addHeart(i, _t);
        }
    },
    preAddEnemy: function (_t) {
        var k = Math.floor(Math.random() * 6.9);
        for (var i = 0; i < 5; i++) {
            if (i == k) continue;
            if (Math.floor(Math.random() * 10) < 7) {
                this.addEnemy(i, _t);
            }
        }

    },
    //この二つのremoveまとめられそうだけど．
    removeHeart: function (_obj) {
        this.heartList.splice(this.heartList.indexOf(_obj), 1);
        this.removeChild(_obj);
        //console.log("delete")
    },
    removeEnemy: function (_obj) {
        this.enemyList.splice(this.enemyList.indexOf(_obj), 1);
        this.removeChild(_obj);
    },
    removeObjOnly: function (_obj) {
        this.removeChild(_obj);
    }
});




var RetryBox = cc.Sprite.extend({
    ctor: function () {
        this._super();
        this.initWithFile(res.img_retry);
        this.setPosition(cc.winSize.width / 2, cc.winSize.height / 2);

        var listener2 = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();
                var location = target.convertToNodeSpace(touch.getLocation());
                var targetSize = target.getContentSize();
                var targetRectangle = cc.rect(0, 0, targetSize.width, targetSize.height);
                if (cc.rectContainsPoint(targetRectangle, location)) {
                    cc.audioEngine.stopMusic();
                    cc.director.runScene(new Title());
                }
                return true;
            }
        });


        cc.eventManager.addListener(listener2.clone(), this);
    },
});

