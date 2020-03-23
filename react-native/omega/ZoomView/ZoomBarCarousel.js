//TODO: DELETE THIS IF UNUSED - Not likely client will want to implement after review

// @flow
import React, { PropTypes } from 'react'
import { Animated } from 'react-native'

import COLORS from 'constants/colors'
import { deviceWidth } from '@instrument/nike/native'

import View from 'constelation-view'
import ScrollView from 'constelation-scroll-view'
//import Image from 'constelation-image'
import Style_ from 'constelation-style_'
//import Event_ from 'constelation-event_'

const FIXED_BAR_WIDTH = deviceWidth - 40
const BAR_SPACE = 10
const FIXED_COMPONENT_WIDTH = deviceWidth

export default class ZoomBarCarousel extends React.Component {
  static propTypes = {
    barColor: PropTypes.string,
    barPositionBottom: PropTypes.number,
    barPositionTop: PropTypes.number,
    scrollEnabled: PropTypes.bool,
    zoomEnabled: PropTypes.bool,
    trackColor: PropTypes.string,
  }

  static defaultProps = {
    barColor: COLORS.DARK,
    barPositionBottom: 40,
    trackColor: COLORS.GREY_INACTIVE,
    scrollEnabled: true,
    zoomEnabled: false,
  }

  childCount = React.Children.count(this.props.children)
  numItems = React.Children.count(this.props.children)
  //itemWidth = (FIXED_BAR_WIDTH / this.numItems) - ((this.numItems - 1) * BAR_SPACE)
  itemWidth = (FIXED_BAR_WIDTH / this.numItems) - BAR_SPACE

  animVal = new Animated.Value(0)

  // To get clamp to work on the right edge we have to clamp using the indicator's left position
  scrollXVal = this.animVal.interpolate({
    inputRange: [0, FIXED_COMPONENT_WIDTH * (this.childCount - 1)],
    outputRange: [0, (FIXED_BAR_WIDTH / this.childCount) * (this.childCount - 1)],
    extrapolate: 'clamp',
  })

  setSliderRef = node => {
    if (node) {
      this.sliderRef = node
    }
  }

  scrollToStart = () => {
    this.sliderRef.scrollTo(0)
  }

  renderBars = () => {

    const bars = []

    for (let i = 0; i < this.numItems; i++) {
      const scrollBarVal = this.animVal.interpolate({
        inputRange: [deviceWidth * (i - 1), deviceWidth * (i + 1)],
        outputRange: [-this.itemWidth - (BAR_SPACE / 2), this.itemWidth + (BAR_SPACE / 2)],
        extrapolate: 'clamp',
      })

      const bar = (
        <Style_
          key={i}
          backgroundColor={this.props.trackColor}
          overflow='hidden'
        >
          <View
            marginLeft={i === 0 ? 0 : BAR_SPACE}
            width={this.itemWidth}
            height={2}
          >
            <Style_
              backgroundColor={this.props.barColor}
              translateX={scrollBarVal}
            >
              <View
                animated
                position='absolute'
                left={0}
                width={this.itemWidth}
                height={2}
                top={0}
              />
            </Style_>
          </View>
        </Style_>
      )
      bars.push(bar)
    }

    return bars

  }

  render() {
    const singleImage = this.props.children.length === 1 ? true : false
    let bars

    if (!singleImage) {
      bars = this.renderBars()
    }
    else {
      bars = null
    }

    return (
      <View
        grow
        alignHorizontal='center'
      >
        <ScrollView
          grow
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={1}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: this.animVal } } }]
          )}
          overflow='visible'
          refNode={this.setSliderRef}
          scrollEnabled={this.props.scrollEnabled}
        >
          {this.props.children}
        </ScrollView>
        {
          !singleImage && (
            <View
              horizontal
              height={0} //takes up space by default without this
              position={this.props.absolute ? 'absolute' : 'relative'}
              bottom={!this.props.barPositionTop ? this.props.barPositionBottom : null}
              top={this.props.barPositionTop}
            >
              {bars}
            </View>
          )
        }

      </View>
    )
  }
}
