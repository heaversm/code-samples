//Allows you to wrap an image in a zoomview to zoom and pan and animate reset by clicking the image
//see https://github.com/facebook/react-native/blob/master/Libraries/Components/ScrollResponder.js for scroll responder events
//see https://github.com/facebook/react-native/blob/master/Libraries/Components/ScrollView/ScrollView.js for scroll view events

import React, { Component, PropTypes } from 'react'

import ScrollView from 'constelation-scroll-view'
import Event_ from 'constelation-event_'
import Image from 'constelation-image'

import { deviceWidth, deviceHeight } from '@instrument/nike/native'

const DISMISS_MODAL_THRESHOLD = 150 //distance we have to scroll in the y direction to dismiss the carousel

export default class ZoomView extends Component {

  static propTypes = {
    doAnimateZoomReset: PropTypes.bool,
    maximumZoomScale: PropTypes.number,
    minimumZoomScale: PropTypes.number,
    zoomed: PropTypes.bool,
    zoomEnabled: PropTypes.bool,
    zoomHeight: PropTypes.number,
    zoomWidth: PropTypes.number,
  }

  static defaultProps = {
    doAnimateZoomReset: false,
    maximumZoomScale: 2,
    minimumZoomScale: 1,
    zoomed: false,
    zoomEnabled: false,
    zoomHeight: deviceHeight,
    zoomWidth: deviceWidth,
  }

  state = {
    startY: null, //y position of touch when we start scrolling on zoom view
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.zoomed === true && this.props.zoomed === false) { //make sure we are scrolled to top
      this.handleResetZoomScale()
    }
  }

  handleResetZoomScale = (event) => {
    this.scrollResponderRef.scrollResponderZoomTo({ x: 0, y: 0, width: this.props.zoomWidth, height: this.props.zoomHeight, animated: true })
  }

  setZoomRef = node => {
    if (node) {
      this.zoomRef = node
      this.scrollResponderRef = this.zoomRef.getScrollResponder()

      this.scrollResponderRef.scrollResponderHandleTouchStart = (event) => {
        const isZoom = event.nativeEvent.touches.length > 1 ? true : false

        if (!this.props.zoomEnabled) { //zoom is not enabled yet, do nothing
          return
        }

        if (!this.props.zoomed) {
          this.setState({ startY: event.nativeEvent.locationY })
        }

        if (isZoom) {
          if (!this.props.zoomed) {
            this.props.onZoomed()
          }
        }

      }

      this.scrollResponderRef.scrollResponderHandleTouchEnd = (event) => {
        if (this.props.zoomed) {
          this.imageRef.measure((ox, oy, width, height, px, py) => {
            if (width <= this.props.zoomWidth) {
              //this.props.onZoomClosePress() //MH TODO: go back to isolated carousel
              this.props.onZoomExit()
              return
            }
            else {
              return
            }
          })
        }
        else {
          const isZoom = event.nativeEvent.touches.length > 1 ? true : false

          if (!isZoom) {
            const currentY = event.nativeEvent.locationY
            const scrollYDistance = Math.abs(this.state.startY - currentY)
            //if we have swiped further up or down than the threshold distance and we're not zooming on an image, dismiss the isolated carousel mode
            if (scrollYDistance > DISMISS_MODAL_THRESHOLD) {
              this.props.onZoomClosePress()
            }
          }
        }
      }
    }
  }

  setImageRef = node => {
    if (node) {
      this.imageRef = node
    }
  }

  handleZoomViewPress = (e) => {

    if (e.nativeEvent.changedTouches.length > 1) { //user is trying to pinch/expand, do nothing
      return
    }

    if (!this.props.zoomEnabled) {
      this.props.onZoomEnabled()
    }
    else {
      if (this.props.zoomed) {
        this.handleResetZoomScale()
        this.props.onZoomClosePress()
      }
    }
  }

  render() {
    return (
      <ScrollView
        contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
        centerContent //centers content when zoom is less than scroll view bounds //MH - required to return shoe to center on click
        maximumZoomScale={this.props.zoomEnabled ? this.props.maximumZoomScale : 1} //setting to 1 disallows zoom
        minimumZoomScale={this.props.minimumZoomScale}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        //bounces={false} //prevents view from bouncing when scroll limits reached
        //bouncesZoom={false} //prevents zoom from bouncing when max / min zoom hit
        refNode={this.setZoomRef}
        scrollEnabled={this.props.zoomEnabled} //prevents you from panning on image (can still zoom)
        overflow='visible'
        scrollEventThrottle={20}
      >
        <Event_
          onPress={this.handleZoomViewPress}
        >
          <Image
            source={this.props.source}
            width={deviceWidth}
            ratioGrow
            overflow='visible'
            refNode={this.setImageRef}
          />
        </Event_>
      </ScrollView>
    )
  }
}
