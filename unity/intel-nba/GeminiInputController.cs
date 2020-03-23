/*
Wrapper around TR's Input Controller for custom functionality
 */
namespace com.instrument {

	using TrueRealitySDK.Core;
	using System.Collections;
	using System.Collections.Generic;
	using UnityEngine;
    using Debug = TrueRealitySDK.Core.Debug;

	public class GeminiInputController : InputController {

        private GameObject reticleDownCollider = null;
        private float timeLastReticleDown = 0f;

        public override void Init(ITRSceneManager inSceneManager, ITREventManager inEventManager) {
            base.Init(inSceneManager, inEventManager);

            // add custom init here
            reticleDownCollider = GameObject.Find("ReticleDownCollider");
        }

    
        //
        // Summary:
        //     Returns true if under handheld-controller control
        //
        public bool IsHandheldControl() {
            return _deviceView != null;
        }

		protected override void CheckInput()
        {
            CheckInputReticleDownGlobal();

            // If there's a current interactible, let the TRInputController handle things
            if (CurrentInteractible != null) {
                base.CheckInput();
                return;
            }

            // There's no current interactible so check for global interactions
            CheckInputSwipeGlobal();
        }

        // Check for an input swipe that's not attached to a specific Interactible
        // Called only if there is no Current Interactible
        void CheckInputSwipeGlobal() {

            // Set the default swipe to be none.
            string swipeId = "none";
            
            // Track button-down mouse position
            if (Input.GetButtonDown("Fire1") || (_deviceView != null && _deviceView.GetButtonDown())) {
                m_MouseDownPosition = new Vector2(Input.mousePosition.x, Input.mousePosition.y);
            }

            // Track button-up mouse position
            if (Input.GetButtonUp("Fire1") || (_deviceView != null && _deviceView.GetButtonUp())) {
                m_MouseUpPosition = new Vector2(Input.mousePosition.x, Input.mousePosition.y);

                // Detect the direction between the mouse positions when Fire1 is pressed and released.
                swipeId = DetectSwipe();
            }

            // If no swipe detected from device, check for keyboard-emulated swipes
            if (swipeId == "none") {
                swipeId = DetectKeyboardEmulatedSwipe();
            }
        }

        // Wrapper around base DetectSwipe for sending swipe events
        protected override string DetectSwipe() {
            string swipeId = base.DetectSwipe();
            if (swipeId != "none") {
                SendSwipeEvent(swipeId);
            }
            return swipeId;
        }

        // Wrapper around base DetectKeyboardEmulatedSwipe for sending swipe events
        protected override string DetectKeyboardEmulatedSwipe() {
            string swipeId = base.DetectKeyboardEmulatedSwipe();
            if (swipeId != "none") {
                SendSwipeEvent(swipeId);
            }
            return swipeId;
        }

        // Send the swipe event
        void SendSwipeEvent(string swipeId) {

            string swipeEventArg = "";
            
            if (swipeId.Equals(swipeUpId)) {
                swipeEventArg = GeminiInputEvent.ARG_SWIPE_UP;
            } else if (swipeId.Equals(swipeDownId)) {
                swipeEventArg = GeminiInputEvent.ARG_SWIPE_DOWN;
            } else if (swipeId.Equals(swipeLeftId)) {
                swipeEventArg = GeminiInputEvent.ARG_SWIPE_LEFT;
            } else if (swipeId.Equals(swipeRightId)) {
                swipeEventArg = GeminiInputEvent.ARG_SWIPE_RIGHT;
            } else {
                Debug.LogError("SendSwipeEvent() got unhandled swipeId " + swipeId);
                return;
            }

            GeminiInputEvent swipeEvent = new GeminiInputEvent(GeminiInputEvent.EVENT_SWIPE);
            swipeEvent.Arg = swipeEventArg;
            swipeEvent.Send(eventManager);
        }


        // Send a reticle-down event, up to once per second
        void SendReticleDownEvent() {

            // Since this may trigger constantly, only send the event once per second
            if (Time.time - timeLastReticleDown > 1f) {
                timeLastReticleDown = Time.time;
                //Debug.Log(Time.time+ " ReticleDown");

                GeminiInputEvent reticleEvent = new GeminiInputEvent(GeminiInputEvent.EVENT_RETICLE);
                reticleEvent.Arg = GeminiInputEvent.ARG_RETICLE_DOWN;
                reticleEvent.Send(eventManager);
            }
        }


        // Do our own raycast, to check if reticle collides with a ReticleDown collider
        private void CheckInputReticleDownGlobal() {

            if (reticleDownCollider != null && ReticleCamera != null)
            {
                Ray ray;
                float GazeDistance = 1000;

                if (_deviceView != null)
                {
                    ray = _deviceView.RayCast();
                }
                else
                {
                    ray = new Ray(ReticleCamera.position, ReticleCamera.forward);
                }

                RaycastHit currentHit;
                bool hitOccurred = Physics.Raycast(ray, out currentHit, GazeDistance); 

                if (hitOccurred && currentHit.collider.gameObject == reticleDownCollider)
                {
                    //Debug.Log(Time.time+ " CheckInputReticleDownGlobal");
                    SendReticleDownEvent();
                }
            }

        }

    }
}
