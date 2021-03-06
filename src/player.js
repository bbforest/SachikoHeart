
var Player = cc.Sprite.extend({
    ctor: function () {
        this._super();
        var size = cc.winSize;
        this.setPosition(size.width / 2, size.height / 8);
        this.targetX = this.getPosition().x;
        this.speed = 15;
        this.HP = 60;
        this.actionList = [];
        this.preMoveX = 0;
        this.isMove = false;
        this.isMuteki = false;
        this.mutekiTime = 0;
        this.preAct = 0;
        this.score = 0;
    },
    update: function (dt) {
        this._super();
        if (this.isMuteki) this.mutekiTime++;
        if (this.mutekiTime == 60) {
            this.mutekiTime = 0;
            this.isMuteki = false;
        }
        var moveX = this.getPosition().x - this.targetX > 0 ? -this.speed : this.speed;
        var nextX = this.getPosition().x + moveX;
        if (Math.abs(this.getPosition().x - this.targetX) < this.speed) {
            moveX = 0;
            nextX = Math.floor(this.targetX / cc.winSize.width * 5) * cc.winSize.width / 5 + cc.winSize.width / 10;
            this.targetX = nextX;
        }
        this.setPosition(nextX, this.getPosition().y);
        if (this.preMoveX != moveX) this.animation(moveX);
        this.preMoveX = moveX;
    },
    onEnter: function () {
        this._super();
        for (var j = 0; j < 3; j++) {
            var sprites = [];
            for (var i = 0; i < 2; i++) {
                sprites.push(new cc.SpriteFrame(res.img_sachiko, cc.rect(90 * i, 180 * j, 90, 180)));
            }
            this.actionList.push(new cc.RepeatForever(new cc.Animate(new cc.Animation(sprites, 0.2))));
        }
        this.runAction(this.actionList[0]);
        this.scheduleUpdate();
    },
    changeTargetX: function (_x) {
        this.targetX = _x;
    },
    scorePlus: function (_point) {
        this.HP += _point;
        this.score += _point;
        gameLayer.addEffectHeart(_point);
    },
    damage: function () {
        if (this.isMuteki) return;
        this.HP -= 20;
        this.isMuteki = true;
        this.runAction(new cc.blink(1, 6));
    },
    getHP: function () {
        return Math.max(this.HP, 0);
    },
    getScore: function () {
        return this.score;
    },
    animation: function (dx) {
        this.stopAction(this.actionList[this.preAct]);
        var act = dx > 0 ? 2 : 1;//ここもっとうまいこと書けそう感
        if (dx == 0) act = 0;
        this.runAction(this.actionList[act]);
        this.preAct = act;
    },
    changeIsMove: function () {
        this.isMove = true;
    }
});