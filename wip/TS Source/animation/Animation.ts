/// <reference path="../_definitions.ts" />

/**
 * Animation
 *
 * An Animation instance contains a single animation and the controls to play it.
 * It is created by the AnimationManager and belongs to Game Objects such as Sprite.
 *
 * @package    Phaser.Animation
 * @author     Richard Davey <rich@photonstorm.com>
 * @copyright  2013 Photon Storm Ltd.
 * @license    https://github.com/photonstorm/phaser/blob/master/license.txt  MIT License
 */

module Phaser {

    export class Animation {

        /**
         * Animation constructor
         * Create a new <code>Animation</code>.
         *
         * @param parent {Sprite} Owner sprite of this animation.
         * @param frameData {FrameData} The FrameData object contains animation data.
         * @param name {string} Unique name of this animation.
         * @param frames {number[]/string[]} An array of numbers or strings indicating what frames to play in what order.
         * @param delay {number} Time between frames in ms.
         * @param looped {bool} Whether or not the animation is looped or just plays once.
         */
        constructor(game: Game, parent: Sprite, frameData: FrameData, name: string, frames, delay: number, looped: bool) {

            this.game = game;
            this._parent = parent;
            this._frames = frames;
            this._frameData = frameData;

            this.name = name;
            this.delay = 1000 / delay;
            this.looped = looped;

            this.isFinished = false;
            this.isPlaying = false;

            this._frameIndex = 0;
            this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

        }

        public game: Phaser.Game;

        /**
         * Local private reference to its owner sprite.
         * @type {Sprite}
         */
        private _parent: Sprite;

        /**
         * Animation frame container.
         * @type {number[]}
         */
        private _frames: number[];

        /**
         * Frame data of this animation.(parsed from sprite sheet)
         * @type {FrameData}
         */
        private _frameData: FrameData;

        /**
         * Index of current frame.
         * @type {number}
         */
        private _frameIndex: number;

        /**
         * Time when switched to last frame (in ms).
         * @type number
         */
        private _timeLastFrame: number;

        /**
         * Time when this will switch to next frame (in ms).
         * @type number
         */
        private _timeNextFrame: number;

        /**
         * Name of this animation.
         * @type {string}
         */
        public name: string;

        /**
         * Currently played frame instance.
         * @type {Frame}
         */
        public currentFrame: Frame;

        /**
         * Whether or not this animation finished playing.
         * @type {bool}
         */
        public isFinished: bool;

        /**
         * Whethor or not this animation is currently playing.
         * @type {bool}
         */
        public isPlaying: bool;

        /**
         * Whether or not the animation is looped.
         * @type {bool}
         */
        public looped: bool;

        /**
         * Time between frames in ms.
         * @type {number}
         */
        public delay: number;

        public get frameTotal(): number {
            return this._frames.length;
        }

        public get frame(): number {

            if (this.currentFrame !== null)
            {
                return this.currentFrame.index;
            }
            else
            {
                return this._frameIndex;
            }

        }

        public set frame(value: number) {

            this.currentFrame = this._frameData.getFrame(value);

            if (this.currentFrame !== null)
            {
                this._parent.texture.width = this.currentFrame.width;
                this._parent.texture.height = this.currentFrame.height;
                this._frameIndex = value;
            }

        }

        /**
         * Play this animation.
         * @param frameRate {number} FrameRate you want to specify instead of using default.
         * @param loop {bool} Whether or not the animation is looped or just plays once.
         */
        public play(frameRate: number = null, loop: bool = null) {

            if (frameRate !== null)
            {
                this.delay = 1000 / frameRate;
            }

            if (loop !== null)
            {
                //  If they set a new loop value then use it, otherwise use the default set on creation
                this.looped = loop;
            }

            this.isPlaying = true;
            this.isFinished = false;

            this._timeLastFrame = this.game.time.now;
            this._timeNextFrame = this.game.time.now + this.delay;

            this._frameIndex = 0;

            this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

            this._parent.events.onAnimationStart.dispatch(this._parent, this);

            return this;

        }

        /**
         * Play this animation from the first frame.
         */
        public restart() {

            this.isPlaying = true;
            this.isFinished = false;

            this._timeLastFrame = this.game.time.now;
            this._timeNextFrame = this.game.time.now + this.delay;

            this._frameIndex = 0;
            this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);

        }

        /**
         * Stop playing animation and set it finished.
         */
        public stop() {

            this.isPlaying = false;
            this.isFinished = true;

        }

        /**
         * Update animation frames.
         */
        public update(): bool {

            if (this.isPlaying == true && this.game.time.now >= this._timeNextFrame)
            {
                this._frameIndex++;

                if (this._frameIndex == this._frames.length)
                {
                    if (this.looped)
                    {
                        this._frameIndex = 0;
                        this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);
                        this._parent.events.onAnimationLoop.dispatch(this._parent, this);
                    }
                    else
                    {
                        this.onComplete();
                    }
                }
                else
                {
                    this.currentFrame = this._frameData.getFrame(this._frames[this._frameIndex]);
                }

                this._timeLastFrame = this.game.time.now;
                this._timeNextFrame = this.game.time.now + this.delay;

                return true;
            }

            return false;

        }

        /**
         * Clean up animation memory.
         */
        public destroy() {

            this.game = null;
            this._parent = null;
            this._frames = null;
            this._frameData = null;
            this.currentFrame = null;
            this.isPlaying = false;

        }

        /**
         * Animation complete callback method.
         */
        private onComplete() {

            this.isPlaying = false;
            this.isFinished = true;
            
            this._parent.events.onAnimationComplete.dispatch(this._parent, this);

        }

    }

}