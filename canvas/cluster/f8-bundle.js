//a dynamic GUI driven HTML canvas animation built in CreateJS

import { autobind } from 'core-decorators';
import { data } from './data';
import 'gsap/EaselPlugin';
import 'gsap';

export default class f8 {
    constructor () {
        //DOM
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
        this.stage = new createjs.Stage('canvas');

        //EASEL
        this.bg = null;
        this.clusterContainer = null; //holds all clusters
        this.clusterTinter = null; //holds cluster container, tints fg
        this.clustersArray = [];
        this.linesArray = [];
        this.resizeTimer = null; //allows us to debounce resize event to detect resize end

        //ANIMATION
        this.mainTimeline = null;
        this.backgroundColorTimeline = null;
        this.step = 1; //iterator for positions
        this.sequence = 1; //iterator for animation sequence

        this.numClusters = data.clusters.length;
        this.numSequences = data.motionSequence.length;

        this.numColors = data.palette.fg.length;
        this.colorProgress = { curProgress: 0, curColor: 0, colorDirection: 1 };
        this.colorProgressTimer = null;
    }

    init () { //once canvas is sized
        window.addEventListener('resize', this.handleResize, false);
        this.sizeCanvas();
        this.buildStage();

        const { animate } = data.settings;

        if (animate) {
            this.initAnimations();
        }
    }

    @autobind
    sizeCanvas () { //first step
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    @autobind
    handleResize () {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(this.clearCanvas, 500);
    }

    @autobind
    clearCanvas () {
        //CLEANUP
        this.stage.removeAllChildren();
        this.stage.clear();
        TweenMax.ticker.removeEventListener('tick');
        TweenMax.killAll();

        createjs.Ticker.reset();
        this.stage.enableDOMEvents(false);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.clustersArray = [];
        this.linesArray = [];

        //ANIMATION
        this.backgroundColorTimeline = null;
        this.mainTimeline = null;
        this.colorProgressTimer = null;
        this.step = 1;
        this.sequence = 1;
        this.colorProgress = { curProgress: 0, curColor: 0, colorDirection: 1 };

        setTimeout(() => {
            this.sizeCanvas();
            this.buildStage();
            this.initAnimations();
        }, 250);
    }

    @autobind
    buildStage () {
        this.buildBackground();
        this.buildClusterContainer();
        this.buildClusterLines();
        this.stage.update();
    }

    @autobind
    buildBackground () {
        this.bg = new createjs.Shape();
        this.bg.bgCmd = this.bg.graphics.f(data.settings.bgStartColor).command;
        this.bg.graphics.drawRect(0, 0, this.canvas.width, this.canvas.height).command;
        this.bg.name = 'bg';
        this.stage.addChild(this.bg);
    }

    @autobind
    buildClusterContainer () {
        const { settings } = data;

        this.clusterTinter = new createjs.Container();
        this.clusterContainer = new createjs.Container();

        this.clusterContainer.x = this.canvas.width / 2;
        this.clusterContainer.y = this.canvas.height / 2;
        if (settings.allowContainerScaling) {
            clusterContainer.scaleX = clusterContainer.scaleY = settings.containerScale;
        }

        this.clusterContainer.name = 'clusterContainer';
        this.buildClusters();
        this.clusterTinter.addChild(this.clusterContainer);
        this.stage.addChild(this.clusterTinter);
    }

    @autobind
    buildClusters () {
        data.clusters.forEach((clusterData) => {
            const cluster = this.buildCluster(clusterData);

            this.clusterContainer.addChild(cluster);
            this.clustersArray.push(cluster);
        });
    }

    @autobind
    buildCluster (params, i) {

        const { x = 0, y = 0, scale = 1, rotation = 0, name = `cluster${i}` } = params;
        const { settings } = data;

        const cluster = new createjs.Container();

        cluster.setTransform(x, y, scale, scale);
        cluster.name = name;

        const circle = this.buildCircle();

        const alpha = scale > settings.alphaThreshold ? settings.blurAlpha : 0;
        const alpha2 = scale > settings.alphaThreshold ? settings.blur2Alpha : 0;

        const blur2 = this.buildBlur2();

        blur2.rotation = rotation;
        blur2.alpha = alpha2;

        const blur1 = this.buildBlur1();

        blur1.rotation = rotation;
        blur1.alpha = alpha;

        cluster.addChild(blur2);
        cluster.addChild(circle);
        cluster.addChild(blur1);

        return cluster;
    }

    @autobind
    buildCircle (fillColor = data.settings.startColor) {
        const { settings } = data;
        const circle = new createjs.Shape();

        circle.circleCmd = circle.graphics.beginFill(fillColor).command;
        circle.graphics.drawCircle(0, 0, settings.circleRadius);
        circle.name = 'circle';

        return circle;

    }

    @autobind
    buildBlur1 () {
        const { settings } = data;
        const blur1 = new createjs.Shape();
        const endColor = this.hexToRGBA(settings.startColor, 0);

        blur1.circleCmd = blur1.graphics.beginRadialGradientFill([settings.startColor, endColor], [settings.blurStop1, settings.blurStop2], 0, 0, 0, 0, 0, settings.circleRadius).command;
        blur1.graphics.drawCircle(0, 0, settings.circleRadius);
        blur1.setTransform(0, settings.blurTransformY, settings.blurScale, settings.blurScale, 0, 0, 0, 0, settings.blurReg); //( [x=0]  [y=0]  [scaleX=1]  [scaleY=1]  [rotation=0]  [skewX=0]  [skewY=0]  [regX=0]  [regY=0] )
        blur1.name = 'blur1';
        return blur1;
    }

    @autobind
    buildBlur2 () {
        const { settings } = data;
        const blur2 = new createjs.Shape();
        const endColor = this.hexToRGBA(settings.startColor, 0);

        blur2.circleCmd = blur2.graphics.beginRadialGradientFill([settings.startColor, endColor], [settings.blur2Stop1, settings.blur2Stop2], 0, 0, 0, 0, 0, settings.circleRadius).command;
        blur2.graphics.drawCircle(0, 0, settings.circleRadius);
        blur2.setTransform(0, settings.blur2TransformY, settings.blur2Scale, settings.blur2Scale, 0, 0, 0, 0, settings.blur2Reg); //( [x=0]  [y=0]  [scaleX=1]  [scaleY=1]  [rotation=0]  [skewX=0]  [skewY=0]  [regX=0]  [regY=0] )
        blur2.name = 'blur2';
        return blur2;
    }

    @autobind
    buildClusterLines () {
        const { clusterConnections, settings } = data;

        clusterConnections.forEach((connection) => {
            const line = new createjs.Shape();
            const originCluster = this.clustersArray[ connection.from - 1 ];
            const destinationCluster = this.clustersArray[ connection.to - 1 ];

            line.graphics.setStrokeStyle(1).s(settings.startColor).moveTo(originCluster.x, originCluster.y).lineTo(destinationCluster.x, destinationCluster.y);
            this.clusterContainer.addChildAt(line, 0);
            const lineObj = {
                originCluster,
                destinationCluster,
                line
            };

            this.linesArray.push(lineObj);
        });
    }

    @autobind
    initAnimations () {
        TweenMax.ticker.addEventListener('tick', this.handleTick, this.stage); //update each time TweenMax updates
        this.initClusterAnimation();
        this.initColorProgress();
    }

    @autobind
    initClusterAnimation () {
        const { clusters } = data;

        this.mainTimeline = new TimelineMax({
            repeat: -1,
        });

        clusters.forEach((clusterData, i) => {
            const clusterObject = this.clustersArray[ i ];
            const isLast = i === this.numClusters - 1;

            if (clusterData.blur !== false) {
                const direction = clusterData.direction || 1;

                this.rotateBlur(clusterObject, 'tween1', direction);
            }
            this.scaleAndMove(clusterObject, clusterData, isLast, i);

        });

    }

    @autobind
    initColorProgress () {
        const { settings } = data;

        this.colorProgressTimer = TweenMax.to(this.colorProgress, settings.colorAnimTime, {
            curProgress: 1,
            repeat: -1,
            onRepeat: this.updateCurColor,
        });
    }

    @autobind
    updateCurColor () {
        if (this.colorProgress.colorDirection === 1) {
            if (this.colorProgress.curColor < this.numColors - 2 ) {
                this.colorProgress.curColor += 1;
            } else {
                this.colorProgress.curColor += 1;
                this.colorProgress.colorDirection = -1;
            }
        } else if (this.colorProgress.colorDirection === -1) {
            if (this.colorProgress.curColor > 1 ) {
                this.colorProgress.curColor -= 1;
            } else {
                this.colorProgress.curColor -= 1;
                this.colorProgress.colorDirection = 1;
            }
        }
    }

    @autobind
    scaleAndMove (item, clusterData, isLast, itemIndex) {

        const { settings, motionSequence } = data;
        const animGroup = `tween${this.step}`;
        const newScale = motionSequence[ this.sequence - 1 ][ itemIndex ].scale;
        const blur1 = item.getChildByName('blur1');
        const blur2 = item.getChildByName('blur2');
        const newAlpha = newScale > settings.alphaThreshold ? settings.blurAlpha : 0;
        const newAlpha2 = newScale > settings.alphaThreshold ? settings.blur2Alpha : 0;

        this.mainTimeline.to(blur1, settings.blurAnimTime, {
            alpha: newAlpha,
        }, animGroup);

        this.mainTimeline.to(blur2, settings.blurAnimTime, {
            alpha: newAlpha2,
        }, animGroup);

        let newPositionX = 0;
        let newPositionY = 0;
        let onCompleteFunction = null;

        newPositionX = motionSequence[ this.sequence - 1 ][ itemIndex ].x;
        newPositionY = motionSequence[ this.sequence - 1 ][ itemIndex ].y;
        onCompleteFunction = isLast ? this.repeatScaleAndMove : null;

        this.mainTimeline.to(item, settings.colorAnimTime, {
            scaleX: newScale,
            scaleY: newScale,
            x: newPositionX,
            y: newPositionY,
            ease: Sine.easeInOut,
            onComplete: onCompleteFunction
        }, animGroup);

    }

    @autobind
    updateAmbientRotation () {
        const { rotationLimiter } = data.settings;

        this.clusterContainer.rotation = this.clusterContainer.rotation -= 1 / rotationLimiter;
    }

    @autobind
    rotateBlur (item, animGroup, direction = 1) {
        const { settings } = data;

        this.mainTimeline.to(item, settings.rotationAnimTime, {
            f: 360 * direction, //MH prevents a glitch from happening in the timeline - without this animation, you will see a stutter
            repeat: -1,
        }, animGroup);
    }

    @autobind
    repeatScaleAndMove () {

        const { clusters } = data;

        this.step += 1;

        if (this.sequence === this.numSequences) {
            this.sequence = 1;
        } else {
            this.sequence += 1;
        }

        clusters.forEach((clusterData, i) => {
            const clusterObject = this.clustersArray[ i ];
            const isLast = i === this.numClusters - 1;

            this.scaleAndMove(clusterObject, clusterData, isLast, i);
        });

    }

    @autobind
    lerpColor (a, b, amount) {
        const ah = a;
        const bh = b;
        const ar = ah >> 16;
        const ag = ah >> 8 & 0xff;
        const ab = ah & 0xff;
        const br = bh >> 16;
        const bg = bh >> 8 & 0xff;
        const bb = bh & 0xff;
        const rr = ar + amount * (br - ar);
        const rg = ag + amount * (bg - ag);
        const rb = ab + amount * (bb - ab);

        return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
    }

    @autobind
    updateClusterLines (curColor) {

        this.linesArray.forEach((lineObj) => {
            const { line, originCluster, destinationCluster } = lineObj;

            line.graphics.clear().s(curColor).moveTo(originCluster.x, originCluster.y).lineTo(destinationCluster.x, destinationCluster.y);
        });
    }

    @autobind
    hexToRGBA (hex, alpha) {
        let c;

        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if(c.length === 3) {
                c = [c[ 0 ], c[ 0 ], c[ 1 ], c[ 1 ], c[ 2 ], c[ 2 ]];
            }
            c = '0x' + c.join('');
            return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + alpha + ')';
        }
        throw new Error('Bad Hex');
    }

    @autobind
    handleTick () {

        const { settings, palette } = data;

        if (settings.ambientRotation) {
            this.updateAmbientRotation();
        }

        const curColor = this.lerpColor(palette.fg[ this.colorProgress.curColor ], palette.fg[ this.colorProgress.curColor + (this.colorProgress.colorDirection * 1) ], this.colorProgress.curProgress);
        const curBgColor = this.lerpColor(palette.bg[ this.colorProgress.curColor ], palette.bg[ this.colorProgress.curColor + (this.colorProgress.colorDirection * 1) ], this.colorProgress.curProgress);

        this.bg.bgCmd.style = curBgColor;

        this.clustersArray.forEach((cluster) => {
            const thisCircle = cluster.getChildByName('circle');
            const thisBlur1 = cluster.getChildByName('blur1');
            const thisBlur2 = cluster.getChildByName('blur2');

            thisCircle.circleCmd.style = curColor;
            //thisCircle.shadow.color = curColor;

            thisBlur1.circleCmd.radialGradient([curColor, this.hexToRGBA(curColor, 0)], [settings.blurStop1, settings.blurStop2], 0, 0, 0, 0, 0, settings.circleRadius);

            thisBlur2.circleCmd.radialGradient([curColor, this.hexToRGBA(curColor, 0)], [settings.blur2Stop1, settings.blur2Stop2], 0, 0, 0, 0, 0, settings.circleRadius);

        });
        this.updateClusterLines(curColor);

        this.stage.update(); //draw the screen
    }

}