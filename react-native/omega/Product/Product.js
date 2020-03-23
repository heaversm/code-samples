// @flow

import React from 'react'
import { Animated, Easing } from 'react-native'
import Video from 'react-native-video'

import NavigationState from 'stores/NavigationState'
import AppChromeState from 'stores/AppChromeState'
import { SHOP_ROUTES } from 'constants/routes'
// import AppOptions, { APP_MODELS } from 'stores/AppOptions'

//import { Event_, Event } from 'constelation-event_'
import { Style, Style_ } from 'constelation-style_'
import { Animate } from 'constelation-animate_'
import View, { Row, Col } from 'constelation-view'
import Image from 'constelation-image'
import { Event } from 'constelation-event_'

import { deviceWidth, deviceHeight } from '@instrument/nike/native'
import COLOR from '@instrument/nike/COLOR'
import Header from '@instrument/nike/Header'
import Text from '@instrument/nike/Text'

//import SIZES from 'constants/sizes'
import ZoomCarousel from 'shared/ZoomCarousel'
import DividedBarCarousel from 'shared/DividedBarCarousel'

import HorizontalSlider from 'shared/HorizontalSlider'
import FadingModal from 'shared/FadingModal'
import BulletList from 'shared/BulletList'
import ScrollViewWithHidingCollapsibleNavBar from 'shared/ScrollViewWithHidingCollapsibleNavBar'
import ProductItem from 'shared/ProductItem' // should breakout to shared soon
import NavBar from 'shared/NavBar'
import ZoomView from 'shared/ZoomView'

import ProductColorway from './_/ProductColorway'
import ProductBuyComponent from './_/ProductBuyComponent'

import { products } from 'data/products'

const BUYBAR_HEIGHT = 60

//const CONTENT_FADE_DURATION = 500
//const CONTENT_FADE_DELAY = 200
const CONTENT_FADE_DURATION = 0
const CONTENT_FADE_DELAY = 0

export default class Product extends React.Component {
  static route = {
    ...FadingModal.route,
  }

  constructor(props) {
    super(props)
    this.product = products[this.safeGetRouteParam('productId')]
  }

  state = {
    stickyHeaders: [],
    tabMeasures: {},
    currentColorwayIndex: 0,
    zoomEnabled: false, //isolated carousel mode
    zoomed: false, //zoomed in on image
  }

  //BUY BAR OPACITY
  navBarOpacity = new Animated.Value(0)

  // COLORWAYS & PRODUCT BUY COMPONENT OPACITY
  modulesOpacity = new Animated.Value(1) // default to 1 because its wrapped in `Animate`

  //ZOOM VIEW
  animZoomVal = new Animated.Value(0) //reveals close button and translates carousel to center of screen

  animTranslateYZoomVal = this.animZoomVal.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 32], //MH TODO: should be measured to ensure it is centered on plus and reg
  })

  animValUpTiming = Animated.parallel([
    Animated.timing(this.animZoomVal, {
      toValue: 1,
      duraton: 200,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }),
    Animated.timing(this.navBarOpacity, {
      toValue: 0,
      duraton: 200,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }),
    Animated.timing(this.modulesOpacity, {
      toValue: 0,
      duraton: 200,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }),
  ])

  animValDownTiming = animValUpTiming = Animated.parallel([
    Animated.timing(this.animZoomVal, {
      toValue: 0,
      duraton: 200,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }),
    Animated.timing(this.navBarOpacity, {
      toValue: 1,
      duraton: 200,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }),
    Animated.timing(this.modulesOpacity, {
      toValue: 1,
      duraton: 200,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }),
  ])

  //SCROLLBAR
  animScrollBarOpacityVal = new Animated.Value(1)
  animScrollOpacityUpTiming = Animated.timing(this.animScrollBarOpacityVal, {
    toValue: 1,
    duraton: 300,
    easing: Easing.inOut(Easing.quad),
    useNativeDriver: true,
  })
  animScrollOpacityDownTiming = Animated.timing(this.animScrollBarOpacityVal, {
    toValue: 0,
    duraton: 300,
    easing: Easing.inOut(Easing.quad),
    useNativeDriver: true,
  })

  //BUY BAR INTRO ANIM
  animBuyVal = new Animated.Value(0)
  animColorwayVal = new Animated.Value(0)

  animBuyTranslateY = this.animBuyVal.interpolate({
    inputRange: [0, 1],
    outputRange: [BUYBAR_HEIGHT, 0], //MH TODO: should be measured to ensure it is centered on plus and reg
  })

  animBuyTranslateTiming = Animated.timing(this.animBuyVal, {
    toValue: 1,
    duraton: 300,
    easing: Easing.inOut(Easing.quad),
    useNativeDriver: true,
  })

  componentDidMount() {
    animValUpTiming = Animated.parallel([
      Animated.timing(this.navBarOpacity, {
        toValue: 1,
        duraton: CONTENT_FADE_DURATION,
        delay: CONTENT_FADE_DELAY,
        easing: Easing.inOut(Easing.quad),
      }),
      Animated.timing(this.animColorwayVal, {
        toValue: 1,
        duraton: 300,
        delay: 200,
        easing: Easing.inOut(Easing.quad),
      }),
      this.animBuyTranslateTiming,
    ]).start()
  }

  safeGetRouteParam(paramName) {
    return (this.props.route ? this.props.route.params[paramName] : null)
  }

  handleBackPress = () => {
    NavigationState.dismissPDP()
  }

  handleDismissRequest = () => {
    // modal is dismissed by ScrollingModal - use this hook for local stuff if needed MG
  }

  handleColorwayPress = (thisColorWayIndex) => {
    this.setState({ currentColorwayIndex: thisColorWayIndex })

    //reinstate below once we have multiple colorways with slider images to swap out in P1 slot
    {/*if (colorway.sliderImages) {
      const thisColorWayIndex = this.product.colorways.findIndex(item => item.color === colorway.color)
      this.setState({ currentColorwayIndex: thisColorWayIndex })
      this.refs._sliderCarousel.scrollToStart()
    }*/}
  }

  handleSearchPress = () => {
    if (!this.state.zoomEnabled) {
      NavigationState.openModal(SHOP_ROUTES.SHOP_SEARCH)
    }
  }

  handleZoomEnabled = () => {
    this.setState({ zoomEnabled: true })
    this.animScrollBarOpacityVal.setValue(0)
    this.animValUpTiming.start(() => {
      this.animScrollOpacityUpTiming.start()
    })

    AppChromeState.hideStatusBar()
  }

  handleZoomed = () => {
    this.setState({ zoomed: true })
    this.animScrollOpacityDownTiming.start()
  }

  handleZoomClosePress = () => {
    if (this.state.zoomEnabled) {
      this.animScrollBarOpacityVal.setValue(0)

      this.setState({ zoomEnabled: false, zoomed: false })
      this.animValDownTiming.start(() => {
        this.animScrollOpacityUpTiming.start()
      })
    }
    AppChromeState.showStatusBar('dark', true)
  }

  handleZoomExit = () => {
    if (this.state.zoomed) {
      this.setState({ zoomed: false, zoomEnabled: true })
      this.animScrollOpacityUpTiming.start()
    }
  }

  renderSliderVideo = (sliderItem) => {
    return (
      <Video
        key={sliderItem.name}
        width={deviceWidth}
        source={sliderItem.video}
        resizeMode='cover'
        repeat
        muted
        paused={false} //MH TODO: pause dynamically if not in view(?)
      />
    )
  }

  renderSliderZoom = (sliderItem, index) => {
    return (
      <ZoomView
        key={sliderItem.name}
        source={sliderItem.image}
        zoomEnabled={this.state.zoomEnabled}
        zoomed={this.state.zoomed}
        onZoomEnabled={this.handleZoomEnabled}
        onZoomClosePress={this.handleZoomClosePress}
        onZoomExit={this.handleZoomExit}
        onZoomed={this.handleZoomed}
        index={index}
      />
    )
  }

  renderSliderImage = (sliderItem) => {
    return (
      <Image
        key={sliderItem.name}
        source={sliderItem.image}
        width={deviceWidth}
        ratioGrow
      />
    )
  }

  renderSliderItems = (sliderItems) => {
    if (sliderItems.length > 1) {

      return (
        <Style_
          animated
          translateY={this.animTranslateYZoomVal}
        >
          <View
            marginBottom={4}
          >
            <ZoomCarousel
              barColor={COLOR.DARK}
              ref='_sliderCarousel'
              scrollEnabled={!this.state.zoomed}
              zoomEnabled={this.state.zoomEnabled}
              scrollOpacity={this.animScrollBarOpacityVal}
            >
              {
                sliderItems !== null && sliderItems.map((sliderItem, i) => {
                  if (sliderItem.type === 'video') {
                    return (this.renderSliderVideo(sliderItem))
                  }
                  else {
                    return (this.renderSliderZoom(sliderItem, i))
                  }
                })
              }
            </ZoomCarousel>
          </View>
        </Style_>
      )
    }
    else {
      return (this.renderSliderImage(sliderItems[0]))
    }
  }

  renderNavBar = () => {
    return (
      <NavBar
        leftButton={
          <Image source={require('images/icons/left-arrow.png')} />
        }
        onLeftButtonPress={this.handleBackPress}
        centerButton={
          <Header
            size={16}
            spacing={0.5}
          >
            {this.product.name}
          </Header>
        }
        rightButton={
          <Image
            source={require('images/icons/search_dark.png')}
          />
        }
        onRightButtonPress={this.handleSearchPress}
        opacity={this.navBarOpacity}
        animated
        border={false}
      />
    )
  }

  render() {
    let colorways = null
    let sliderItems = null
    if (this.product.colorways && this.product.colorways.length > 0) {
      colorways = this.product.colorways

      //const colorway = colorways[this.state.currentColorwayIndex] //MH TODO: reenable this once we have multiple colorways with sliderItems
      const colorway = colorways[0] //MH TEMP: Static slider items that dont respond to colorway click
      if (colorway && colorway.sliderItems && colorway.sliderItems.length > 0) {
        sliderItems = colorway.sliderItems
      }
    }

    return (
      <View
        backgroundColor='white'
        grow
      >
        <ScrollViewWithHidingCollapsibleNavBar
          renderNavBar={this.renderNavBar}
          scrollEnabled={this.state.zoomEnabled ? false : true} //disable vertical scrolling when zoom enabled
        // animInverseZoomVal={this.animInverseZoomVal}
        >
          <View
            paddingBottom={12}
            onLayout={this.handleLayout}
          >
            {sliderItems !== null && this.renderSliderItems(sliderItems)}

            { // colorways
              colorways !== null && colorways.length > 1 && (
                <Style_
                  opacity={this.modulesOpacity}
                  animated
                >
                  <View>
                    <Style
                      opacity={this.animColorwayVal}
                      animated
                    >
                      <HorizontalSlider>
                        {
                          colorways.map((colorway, i) => {
                            return (
                              <ProductColorway
                                isActive={i === 0 ? true : false}
                                onPress={this.handleColorwayPress}
                                colorway={colorway}
                                index={i}
                                key={colorway.color}
                                currentColorwayIndex={this.state.currentColorwayIndex}
                              />
                            )
                          })
                        }
                      </HorizontalSlider>
                    </Style>
                  </View>
                </Style_>
              )
            }

            <Col
              paddingTop={45}
              paddingHorizontal={28}
            >
              <Header
                size={20}
                height={25}
              >
                {this.product.name}
              </Header>

              {/* TODO:
                  Remove these Views and use constelation-space after React Native fixes things
                */}
              <Text
                size={14}
                height={24}
              >
                {this.product.subtitle}
              </Text>

              <View height={14} />

              <Text
                size={14}
                height={30}
              >
                {this.product.details.description}
              </Text>
              <View height={28} />
              {
                this.product.details.bullets && (
                  <BulletList bullets={this.product.details.bullets} />
                )
              }
              <View height={30} />
              <Text
                size={14}
                height={26}
                style={{ textDecorationLine: 'underline' }}
              >
                More Details
                </Text>
              <View height={36} />

              <Style_
                borderTopWidth={1}
                borderTopColor={COLOR.E5}
                borderBottomWidth={1}
                borderBottomColor={COLOR.E5}
              >
                <View
                  height={80}
                  paddingHorizontal={10}
                  horizontal
                  align={'center'}
                >
                  <Header
                    size={16}
                    spacing={.5}
                    style={{ backgroundColor: 'transparent' }}
                  >
                    SIZE & FIT
                        </Header>
                  <View
                    grow
                  />
                  <Image
                    source={require('images/icons/plus.png')}
                    width={14}
                    height={14}
                  />
                </View>
              </Style_>

              <Style_
                borderBottomWidth={1}
                borderBottomColor={COLOR.E5}
              >
                <View
                  height={80}
                  paddingHorizontal={10}
                  horizontal
                  align={'center'}
                >
                  <Style_
                    backgroundColor='transparent'
                  >
                    <Header
                      size={16}
                      spacing={.5}
                    >
                      SHIPPING
                        </Header>
                  </Style_>
                  <Style
                    grow
                    align='flex-end'
                    backgroundColor='transparent'
                    paddingRight={20}
                  >
                    <Text
                      spacing={.5}
                      size={15}
                    >
                      Free / Arrives Oct. 7
                          </Text>
                  </Style>
                  <Image
                    source={require('images/icons/plus.png')}
                    width={14}
                    height={14}
                  />
                </View>
              </Style_>

              <Style_
                borderBottomWidth={1}
                borderBottomColor={COLOR.E5}
              >
                <View
                  height={80}
                  paddingHorizontal={10}
                  horizontal
                  align={'center'}
                >
                  <Style_
                    backgroundColor='transparent'
                  >
                    <Header
                      size={16}
                      spacing={.5}
                    >
                      REVIEWS (31)
                        </Header>
                  </Style_>
                  <View
                    grow
                    align='flex-end'
                    paddingRight={20}
                  >
                    <Image
                      source={require('images/icons/review-stars.jpg')}
                    />
                  </View>
                  <Image
                    source={require('images/icons/plus.png')}
                    width={14}
                    height={14}
                  />
                </View>
              </Style_>
            </Col>
            {
              this.product.featureImages && (
                <View
                  marginTop={60}
                >
                  <DividedBarCarousel
                    barColor={COLOR.DARK}
                    trackColor={COLOR.E5}
                    barPositionTop={175}
                    absolute //render bars over image
                    ref='featureCarousel'
                  >

                    {
                      this.product.featureImages.map((featureImage, i) => {
                        return (
                          <View
                            key={featureImage.name}
                          >
                            <Image
                              source={featureImage.image}
                              width={deviceWidth}
                              ratioGrow
                            />
                            <Style
                              backgroundColor='transparent'
                              position='absolute'
                              top={58}
                              left={0}
                              right={0}
                              center
                            >
                              <View width={270}>
                                <Header size={18} align='center'>{featureImage.title}</Header>
                                <View height={18} />
                                <Text size={15} height={24} align='center' color='8D'>{featureImage.description}</Text>
                              </View>
                            </Style>
                          </View>
                        )
                      })
                    }
                  </DividedBarCarousel>
                </View>
              )
            }

            {
              this.product.shareImages && (
                <View>
                  <Row
                    marginTop={44}
                    marginBottom={8}
                    height={80}
                    paddingHorizontal={28}
                    alignVertical='center'
                    justify='space-between'
                  >
                    <Header size={16}>{this.product.shareTag || '#NIKE'}</Header>
                  </Row>

                  <HorizontalSlider>
                    <View paddingHorizontal={28} horizontal>
                      {
                        this.product.shareImages.map((shareImage, index) =>
                          <View
                            alignSelf='flex-end'
                            key={shareImage.name}
                            marginLeft={index !== 0 ? 5 : 0}
                          >
                            <Image
                              marginBottom={20}
                              source={shareImage.image}
                            />
                            <Text size={14} height={28}>{shareImage.user}</Text>
                            <Row align='center'>
                              <Image
                                source={require('images/icons/heart.png')}
                                tintColor={COLOR['8D']}
                                ratioGrow
                                width={8}
                                marginRight={3}
                              />
                              <Text size={12} color='8D'>{shareImage.likeCount}</Text>
                            </Row>
                          </View>
                        )
                      }
                    </View>
                  </HorizontalSlider>
                </View>
              )
            }


            <Row
              marginTop={48}
              height={80}
              paddingHorizontal={28}
              alignVertical='center'
              justify='space-between'
            >
              <Header size={16}>Style With</Header>
              <Text color='8D'>View More</Text>
            </Row>


            <View
              horizontal
              wrap='wrap'
              paddingBottom={60}
            >
              {
                this.product.completeImages && this.product.completeImages.map((product, index) => {
                  const productProps = { ...product, ...{ productIndex: index } }
                  return (
                    <ProductItem
                      {...productProps}
                      alternateIndent
                      key={`${product.name} ${index}`}
                    />
                  )
                })
              }
            </View>
            <View
              height={100}
            />
          </View>
        </ScrollViewWithHidingCollapsibleNavBar>
        {
          this.state.zoomEnabled &&
          (
            <Style_
              animated
              opacity={this.animZoomVal}
            >
              <View
                animated
                position='absolute'
                top={44}
                right={20}
              >
                <Event
                  onPress={this.handleZoomClosePress}
                  hitSlop={20}
                >
                  <Image
                    source={require('images/icons/close.png')}
                  />
                </Event>
              </View>
            </Style_>
          )
        }
        <Style
          opacity={this.modulesOpacity}
          animated
          translateY={this.animBuyTranslateY}
        >
          <ProductBuyComponent
            buyBarHeight={BUYBAR_HEIGHT}
            sizing={this.product.category || 'shoes'}
          />
        </Style>

      </View>
    )
  }
}
