// @flow
import React, { PropTypes } from 'react'
import { Animated } from 'react-native'
import { observer } from 'mobx-react/native'

import View from 'constelation-view'
import ScrollView from 'constelation-scroll-view'

import { APP_TABS } from 'constants/routes'
import { FEED } from 'constants/routes'
import withFadeUp from 'shared/withFadeUp'

import { emitter } from 'utils'

import TabSwitcherState from 'stores/TabSwitcherState'

import ScrollViewWithCollapsibleNavBar from 'shared/ScrollViewWithCollapsibleNavBar'

import VideoCard from './_/VideoCard'
import FeedImageCard from './_/FeedImageCard'
import FeedScroller from './_/FeedScroller'

@observer
class Feed extends React.Component {

  scrollRef: ScrollView

  static propTypes = {
    navigator: PropTypes.object,
  }

  scrollY = new Animated.Value(0)

  numItems = this.props.data ? this.props.data.length : null

  componentWillMount() {
    emitter.on('app-tab-reset', this.handleAppTabPress)
  }

  componentWillUnmount() {
    emitter.off('app-tab-reset', this.handleAppTabPress)
  }

  handleAppTabPress = (tabId: string) => {
    if (tabId === FEED) {
      this.scrollRef.scrollTo({ y: 0 })
    }
  }

  getCardImageMarginTop(index: number) {
    if (index === 0) { //if the image is in the first slot, no margin is needed
      return 0
    }
    else if (this.props.data[index - 1].type && this.props.data[index - 1].type === 'scroller') { //card image preceded by scroller
      return 66
    }
    else {
      return 5
    }
  }

  handleScroll = (scrollY: number) => {
    this.scrollY.setValue(scrollY)
  }

  renderFeedItem = (item: Object, index: number, array) => {

    const cardMarginBottom = index === this.numItems - 1 ? 40 : 0 //need a bottom margin on last card so it does not bump against tab bar

    switch (item.type) {
      case 'scroller':
        return (
          <View
            marginBottom={cardMarginBottom}
            key={item.headerText}
          >
            <FeedScroller
              {...item}
            />
          </View>
        )
      case 'video':
        return (
          <View
            key={item.title || index}
            marginTop={this.getCardImageMarginTop(index)}
            marginBottom={cardMarginBottom}
          >
            <VideoCard
              {...item}
              scrollY={this.scrollY}
              isFocused={TabSwitcherState.tabID === APP_TABS.FEED}
              aspect={item.aspect}
            />
          </View>
        )
      case 'imageCard':
        return (
          <View
            marginTop={this.getCardImageMarginTop(index)}
            marginBottom={cardMarginBottom}
            key={`imageCard${index}`}
          >
            <FeedImageCard
              {...item}
            />
          </View>
        )
      default:
        console.error(`unknown feed type ${item.type}`)
        return null
    }
  }

  setScrollRef = (node: ?ScrollView) => {
    if (node) {
      this.scrollRef = node
    }
  }

  render() {
    return (
      <ScrollViewWithCollapsibleNavBar
        navbarProps={{ title: 'FOR YOU' }}
        returnScrollPosition={this.handleScroll}
        isFocused={TabSwitcherState.tabID === APP_TABS.FEED}
        refNode={this.setScrollRef}
      >
        {
          this.props.data && this.props.data.map(this.renderFeedItem)
        }
        <View height={80} />
      </ScrollViewWithCollapsibleNavBar>
    )
  }
}

export default withFadeUp(Feed)
