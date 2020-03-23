//A scrollview with an overlaid bar which animates in accordance with the indexed position of the slider

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

const FIXED_BAR_WIDTH = 280
const FIXED_COMPONENT_WIDTH = deviceWidth

const SCROLLY_TRANSLATE = deviceWidth > 375 ? 96 : 85 //MH TODO: should be measured to ensure it is centered on plus and reg


export default class ZoomCarousel extends React.Component {
  static propTypes = {
    barColor: PropTypes.string,
    barPositionBottom: PropTypes.number,
    barPositionTop: PropTypes.number,
    scrollEnabled: PropTypes.bool,
    trackColor: PropTypes.string,
    zoomEnabled: PropTypes.bool,
  }

  static defaultProps = {
    barColor: COLORS.DARK,
    barPositionBottom: 40,
    scrollEnabled: true,
    trackColor: COLORS.GREY_INACTIVE,
    zoomEnabled: false,
  }

  childCount = React.Children.count(this.props.children)

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

  render() {
    const singleImage = this.props.children.length === 1 ? true : false
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
            <Style_
              translateY={this.props.zoomEnabled ? SCROLLY_TRANSLATE : 0}
            >
              <View
                position='absolute'
                width={FIXED_BAR_WIDTH}
                height={2}
                bottom={!this.props.barPositionTop ? this.props.barPositionBottom : null}
                top={this.props.barPositionTop}
                marginHorizontal={-0.1}
              >
                <Style_
                  animated
                  backgroundColor={this.props.trackColor}
                  opacity={this.props.scrollOpacity}
                >
                  <View>
                    <Style_
                      backgroundColor={this.props.barColor}
                    >
                      <View
                        animated
                        width={FIXED_BAR_WIDTH / React.Children.count(this.props.children)}
                        height={2}
                        marginHorizontal={-0.1}
                        left={this.scrollXVal}
                      />
                    </Style_>
                  </View>
                </Style_>
              </View>
            </Style_>
          )
        }

      </View>
    )
  }
}
