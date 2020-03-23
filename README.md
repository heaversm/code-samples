# Mike Heavers Code Samples

This is a small sample of code I've written, implemented, and modified in various languages, frameworks, and platforms. None of the samples here are fully operational, with the exception of the React context-hooks project.

**Too much code, what should I focus on?**

This repo has numerous github issues, which highlight relevant lines of code which might be of interest and provide additional context into what is happening

**What was your role?**

These projects range from ones in which I was the sole developer, to others in which I was part of a tightly integrated team, in which case bits of code might be coming from various places. In some projects, all of the code is my own, and in others I have adapated it from various libraries, stack overflow issues, tutorials, and sources on the web. Project-specific roles are outlined in the `contents` section below. Unless otherwise noted, code is self-written.

## Contents

* API (NodeJS) - An example of a simple CRUD API with a Postman Collection for testing. **Role**: Sole Developer

* Arduino (C/C++): FitProto - An in-store installation with embedded electronics including light and proximity sensing, LEDs, and battery charger. **Role**: Sole developer
* Canvas (JS): Cluster - An animated generative particle system made in CreateJS with a GUI for controlling numerous aspects of the animation. **Role**: Sole Developer
* Javascript: XXV - a large format in-store display built in the javascript game engine PIXI.js for optimized performance and bundled from components into one single file as an electron app. **Role**: One of two developers. Implemented the initial code and the later performance and animation enhancements.

* ML: Stylegan Transitions - A latent space walk in P5.js to animate between generative landscape images using StyleGAN.  **Role**: Sole Developer. **Code**: based on an idea I got from the [Coding Train](https://www.youtube.com/channel/UCvjgXvBlbQiydffZU7m1_aw).

* Python
    * ReplaceBG - Uses openCV to do some edge detection and thresholding to facilitate the removal of backgrounds from photos for a photobooth. **Role**: Sole Developer

    * ScrapeImages - Scrapes images from Google to gather source material for Machine Learning Model Training (Deeplab) **Role**: Sole Developer. **Code**: Adapted from various stack overflow issues and [Gene Kogan's ML4A Guides](https://ml4a.github.io/guides/)

* React (JS): Context-Hooks - a small end to end react application which shows a typical React project structure I woirk in, including the inclusion of:
    * tests
    * storybook
    * hooks
    * context API
    * a focus trap modal
    * basic routing with React Router
    * **Role**: Sole developer
    * **Code**: Built from a base starter repo as part of a coding exercise I was asked to do.

* React Native (JS)
    * Omega - Some bits and pieces of a large scale React Native Prototype App to highlight views and their components.
    * UI Components - Particularly complex custom components with unique user interaction and animation, including a carousel with crossfading images, a collapsible accordion menu with internal scrollable regions, and a horizontal scrolling carousel with pinch-zoomable product images.
    * **Role**: One of a team of ~5 developers
    * **Code**: Bits of this code come frome various team members. Wrote most of the component-specific layout, interaction, and animation.

* Unity (C#)
    * Bits from a VR application that implement a unique 3D menu to browse a concentric 3D menu and support unique non-native controller gestures such as swipe, as well as non-controller gestures such as gaze. **Role**: One of a team of ~7 developers, charged primarily with prototyping UI interaction and animation, working most closely with designers and 3D modelers. **Code**: Bits of code were written by our partners who developed the base VR components and data pipeline. Other bits were written by various team members. I wrote most UI-specific interactions and animations.
    
* WebGL: Spiral - Adapted code which uses WebGL and GLSL shaders to create a generative amorphous 3D spiral. **Role**: Sole developer. **Code**: Modified shaders and interaction states from the WebGL Fluid Simulation by [Pavel Dobryakov](https://github.com/PavelDoGreat)

