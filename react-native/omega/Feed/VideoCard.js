import React, { PropTypes } from 'react'
import Video from 'react-native-video'
import throttle from 'lodash/throttle'

import View from 'constelation-view'
import Style_ from 'constelation-style_'
import Text from '@instrument/nike/Text'
import COLORS from 'constants/colors'
import Header from '@instrument/nike/Header'
import { deviceWidth, deviceHeight } from '@instrument/nike/native'
import FeedSocialIcons from './FeedSocialIcons'

export default class VideoCard extends React.Component {
  static propTypes = {
    aspect: PropTypes.number,
    textMargin: PropTypes.number,
    videoSource: PropTypes.string,
  }

  static defaultProps = {
    aspect: 1.6,
    textMargin: 120,
  }

  state = {
    paused: true,
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isFocused !== this.props.isFocused) {
      const paused = !nextProps.isFocused // if Feed is not focused, pause video
      if (paused) {
        this.setState({ paused })
      }
      else {
        this.handleVideoPlayState(this.props.scrollY ? this.props.scrollY._value : 0)
      }
    }
  }

  componentDidMount() {
    // checks to see if there is a animated scrollY value being added, and adds an event listener
    if (this.props.scrollY && this.props.scrollY.addListener) {
      this.props.scrollY.addListener(throttle(this.handleScroll, 400))
    }
  }

  handleScroll = ({ value }) => {
    this.handleVideoPlayState(value)
  }

  setRef = (node) => {
    this.video = node
  }

  measurements = {}

  handleLayout = () => {
    this.video.measure((ox, oy, width, height, px, py) => {
      this.measurements = {
        py,
        height,
      }
      this.handleVideoPlayState(0)
    })
  }

  handleVideoPlayState = (value) => {
    const isElementInView = value + deviceHeight >= this.measurements.py && value <= this.measurements.py + this.measurements.height

    if (isElementInView && this.state.paused) {
      this.setState({ paused: false })
    }
    else if (!isElementInView && !this.state.paused) {
      this.setState({ paused: true })
    }
  }

  handleIconPress = (iconId) => {
    //eventually should determine which icon is being pressed and perform appropriate action within card
  }

  render() {

    let videoText //this text will overlay the video
    if (this.props.title) {
      videoText = (
        <Style_
          position='absolute'
          backgroundColor='transparent'
          width={deviceWidth}
          bottom={this.props.textMargin}
        >
          <View>
            <Header
              size={20}
              align='center'
            >
              {this.props.title}
            </Header>
            <Text
              color={'8D'}
              marginTop={5}
              align='center'
            >
              {this.props.subtitle}
            </Text>
          </View>
        </Style_>
      )
    }

    return (
      <View
        width={deviceWidth}
        height={deviceWidth * this.props.aspect}
        refNode={this.setRef}
        onLayout={!this.measurements.py ? this.handleLayout : () => null}
      >
        <Style_
          position='absolute'
          top={0}
          left={0}
          right={0}
          bottom={0}
        >
          <Video
            source={this.props.source}
            resizeMode='cover'
            repeat
            muted
            paused={this.state.paused}
          />
        </Style_>
        {videoText}
        <FeedSocialIcons
          theme={this.props.theme}
        />
      </View>
    )
  }
}
