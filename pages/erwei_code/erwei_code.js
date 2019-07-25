// pages/erwei_code/erwei_code.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canvasimgbg:'../img/person/bg.jpg',
    canvastx:'',
    canvasewm:'',
    windowW:'750rpx',
    windowH:'1100rpx',
    nike:'我是微信昵称',
    tuijian:'向你推荐',
    ratio:'',
    canvas_type:1,
    shouci: false,
    position: 'auto',
    my_uid: '',
    session_key:'',
    jiangli:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (options.previous_id) {
      that.setData({
        my_uid: options.previous_id
      })
    }
    if (options.scene) {
      that.setData({
        my_uid: options.scene
      })
    }
    if (!wx.getStorageSync('user_img') || !wx.getStorageSync('openid')) {
      console.log(that.data.my_uid)
      // 没授权并且是通过分享进来的
      if (getApp().globalData.isHUdShowed == 0) {
        that.setData({
          shouci: !that.data.shouci,
          position: 'fixed'
        })
      }
      getApp().globalData.isHUdShowed = 1
      console.log(getApp().globalData.isHUdShowed)
      that.get_login()
    } else {
      that.get_login()
    }
  },
  get_login: function () {
    var that = this;
    wx.login({
      success: res => {
        wx.request({
          url: getApp().globalData.url + "/api/api/get_openid_api",
          data: {
            code: res.code
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            console.log(res)
            if (res.data.code == 1) {
              if (!wx.getStorageSync('user_img') || !wx.getStorageSync('openid')) {
                wx.setStorageSync('uid', res.data.data.user_info.uid)
                wx.setStorageSync('openid', res.data.data.user_info.openid)
                wx.setStorageSync('user_img', res.data.data.img)
                wx.setStorageSync('user_nickname', res.data.data.nickname)
                wx.setStorageSync('isphone', res.data.data.user_info.mobile)
                that.setData({
                  session_key: res.data.data.user_info.session_key,
                  jiangli: res.data.data.user_info.jiangli
                })
              } else {
                that.get_info()
              }
            } else {
              console.log("失败了")
            }
          }
        })
      }
    })
  },
  //获取用户信息接口
  shouci: function (e) {
    console.log(e)
    if (e.detail.userInfo) {
      var that = this;
      wx.setStorageSync('user_img', e.detail.userInfo.avatarUrl)
      wx.setStorageSync('user_nickname', e.detail.userInfo.nickName)
      wx.login({
        success: res => {
          console.log(res)
          if(res.code){

            wx.request({
              url: getApp().globalData.url + "/api/api/get_unionid_api",
              data: {
                uid: wx.getStorageSync('uid'),
                code: res.code,
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv
              },
              header: {
                'content-type': 'application/json'
              },
              success: function (res) {
                // wx.navigateTo({
                //   url: '/pages/logs/logs',
                // })
              }
            })
          }

        }
      })
      wx.request({
        url: getApp().globalData.url + "/api/api/save_info",
        data: {
          uid: wx.getStorageSync('uid'),
          nickname: e.detail.userInfo.nickName,
          avatar: e.detail.userInfo.avatarUrl,
          previous_id: that.data.my_uid
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          console.log(res)
          if (res.data.code == 1) {
            // console.log(res)
            that.setData({
              shouci: false,
              position: 'auto'
            })
            that.get_info();
            if (that.data.session_key == "") {
              wx.showToast({
                title: '老朋友，欢迎您回家',
                icon: 'none'
              })
            } else {
              wx.showToast({
                title: '您已授权成功，获得' + that.data.jiangli + '积分新用户奖励',
                icon: 'none'
              })
            }

            // wx.switchTab({
            //   url: '/pages/mianfei/mianfei'
            // })
          }
        }
      })
    } else {
      var that = this;
      that.setData({
        shouci: false,
        position: 'auto'
      })
      wx.showToast({
        title: '进行微信授权可体验更多精彩服务',
        icon: 'none'
      })
    }
  },
  // 首次进来的授权弹框关闭按钮
  qvxiao: function () {
    var that = this;
    that.setData({
      shouci: false,
      position: 'auto'
    })
  },
  fanhui: function () {
    wx.switchTab({
      url: '/pages/home/home',
    })
  },
  onShareAppMessage: function () {
    var uid = wx.getStorageSync('uid');
    return {
      // title: '免费线路等你来拿',
      desc: '免费线路等你来拿',
      imageUrl: 'https://www.lvbantongxing.cn/upload/banner/免费线路banner_640_320.png',
      path: '/pages/home/home?previous_id=' + uid, // 路径，传递参数到指定页面。
      success: function (res) {
        console.log("成功")
      },
      fail: function (err) {
        console.log("失败")
      }
    }
  },
  onReady:function(){
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
        that.setData({
          ratio: res.screenWidth/375
        })
      },
    })
  },
  onShow:function(){
    var that=this;
    that.get_info();
  },
  get_info:function(){
    var that = this;
    wx.request({
      url: getApp().globalData.url + '/api/home/my_qrcode_api',
      data: {
        uid: wx.getStorageSync('uid')
      },
      success: res => {
        console.log(res)
        that.setData({
          nike: res.data.data.user_info.nickname,
          canvastx: res.data.data.user_info.avatar,
          canvasewm: res.data.data.user_info.qrcode
        })
      }
    });
  },
  canvasdraw: function () {
      var that = this;
      wx.showToast({
        title:'图片正在生成保存中',
        icon: 'loading',
        duration: 2000
      });
      wx.getImageInfo({
        src: that.data.canvastx,
        success(res) {
          console.log(res)
          that.setData({
            canvastx: res.path
          })
          setTimeout(function(){
            console.log(that.data.canvastx)
          },1000)
        }
      })
    wx.getImageInfo({
      src: that.data.canvasewm,
      success(res) {
        console.log(res)
        that.setData({
          canvasewm: res.path
        })
        setTimeout(function () {
          console.log(that.data.canvasewm)
          that.get_canvas()
        }, 1000)
      }
    })
      that.setData({
        canvas_type:2
      })
  },

  get_canvas:function(){
    var that = this;
    let ratio = that.data.ratio;
    var canvas = wx.createCanvasContext('canvas');
    var canvasimgbg = that.data.canvasimgbg;
    var canvasewm = that.data.canvasewm;
    console.log(canvasewm)
    var canvastx = that.data.canvastx;
    var nike_name = that.data.nike;
    var tuijian = that.data.tuijian;
    canvas.setFillStyle('#F2F2F2');
    canvas.fillRect(0, 0, 375 * ratio, 80 * ratio);
    canvas.setFillStyle('#fff');
    canvas.fillRect(0, 76, 375 * ratio, 470 * ratio);
    canvas.setFillStyle('#333')//文字颜色：默认黑色
    canvas.setFontSize(17 * ratio)//设置字体大小，默认10
    canvas.fillText(nike_name, 74 * ratio, 30 * ratio)//绘制文本
    canvas.setFillStyle('#8D8D8D')//文字颜色：默认黑色
    canvas.setFontSize(16 * ratio)//设置字体大小，默认10
    canvas.fillText(tuijian, 74 * ratio, 60 * ratio)//绘制文本
    canvas.setFillStyle('#333')//文字颜色：默认黑色
    canvas.setFontSize(16 * ratio)//设置字体大小，默认10
    canvas.fillText('免费免费', 14 * ratio, 470 * ratio)//绘制文本
    canvas.fillText('免费的旅游线路等你来领取', 14 * ratio, 490 * ratio)//绘制文本
    canvas.setFillStyle('#A1A1A1')//文字颜色：默认黑色
    canvas.fillText('旅伴同行', 14 * ratio, 514 * ratio)//绘制文本
    canvas.drawImage(canvastx, 14 * ratio, 15 * ratio, 49 * ratio, 49 * ratio);
    canvas.drawImage(canvasimgbg, 14 * ratio, 90 * ratio, 347 * ratio, 340 * ratio);
    canvas.drawImage(canvasewm, 270 * ratio, 440 * ratio, 92 * ratio, 92 * ratio);
    canvas.draw(true, setTimeout(function () {
      that.save_tp()
    }, 1000));
  },
  save_tp:function(){
    wx.canvasToTempFilePath({
      canvasId: 'canvas',
      fileType: 'jpg',
      success(res) {
        wx.authorize({
          scope: 'scope.writePhotosAlbum',
          success() {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success() {
                wx.showToast({
                  title: '图片保存成功'
                })
              }
            })
          }
        })
      }
    }, this)
  }
})