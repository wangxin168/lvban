// pages/lvban/lvban.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cur_type:1,
    all_info_data: [],
    current_page: 1,
    sum_page: 1,
    type_one_num:0,
    type_two_num:0,
    shouci: false,
    position: 'auto',
    my_uid: '',
    session_key:'',
    jiangli: ''
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
                that.get_data_info()
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
      shouci: false
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
  change_type:function(e){
    var that = this;
    if (that.data.cur_type == e.currentTarget.dataset.index){
      return false;
    }else{
      that.setData({
        cur_type: e.currentTarget.dataset.index,
        all_info_data:[],
        current_page:1,
        sum_page: 1
      })
      if (that.data.cur_type == 1){
        that.get_data_info();
      } else if (that.data.cur_type == 2){
        that.get_type_two();
      }
    }
  },
  get_data_info:function(){
    var that = this;
    // wx.showLoading({
    //   title: '加载中',
    // })
    wx.request({
      url: getApp().globalData.url + '/api/home/direct_partner_api',
      data: {
        uid: wx.getStorageSync('uid'),
        page: that.data.current_page,
        pagesize: 8
      },
      success: function (data) {
        wx.hideLoading();
        if (data.data.code == 1) {
          if (that.data.current_page == 1) {
            that.setData({
              all_info_data: data.data.data.direct_partner,
              sum_page: data.data.data.totalpage,
              type_one_num: data.data.data.count1,
              type_two_num: data.data.data.count2
            })
          } else {
            var new_page_cont = that.data.all_info_data;
            var current_guide_list = data.data.data.direct_partner;
            for (var i = 0; i < current_guide_list.length; i++) {
              new_page_cont.push(current_guide_list[i])
            }
            that.setData({
              all_info_data: new_page_cont
            })
          }

        } else {
          wx.showToast({
            title: data.data.error,
            icon: 'loading',
            duration: 1000
          });
        }
      },
      fail: function () {
        wx.hideLoading();
        wx.showToast({
          title: '请求失败',
          icon: 'loading',
          duration: 1000
        })
      }
    })
  },
  get_type_two:function(){
    var that = this;
    // wx.showLoading({
    //   title: '加载中',
    // })
    wx.request({
      url: getApp().globalData.url + '/api/home/indirect_partner_api',
      data: {
        uid: wx.getStorageSync('uid'),
        page: that.data.current_page,
        pagesize: 8
      },
      success: function (data) {
        wx.hideLoading();
        if (data.data.code == 1) {
          if (that.data.current_page == 1) {
            that.setData({
              all_info_data: data.data.data.indirect_partner,
              sum_page: data.data.data.totalpage,
              type_one_num: data.data.data.count1,
              type_two_num: data.data.data.count2
            })
          } else {
            var new_page_cont = that.data.all_info_data;
            var current_guide_list = data.data.data.direct_partner;
            for (var i = 0; i < current_guide_list.length; i++) {
              new_page_cont.push(current_guide_list[i])
            }
            that.setData({
              all_info_data: new_page_cont
            })
          }
        } else {
          wx.showToast({
            title: data.data.error,
            icon: 'loading',
            duration: 1000
          });
        }
      },
      fail: function () {
        wx.hideLoading();
        wx.showToast({
          title: '请求失败',
          icon: 'loading',
          duration: 1000
        })
      }
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this;
    wx.stopPullDownRefresh();
    that.setData({
      all_info_data: [],
      current_page: 1,
      sum_page: 1
    })
    if (that.data.cur_type == 1) {
      that.get_data_info();
    } else if (that.data.cur_type == 2) {
      that.get_type_two();
    }
  },
  onShow:function(){
    var that=this;
    that.get_data_info()
    
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    var current_page = null;
    current_page = that.data.current_page + 1;
    that.setData({
      current_page: current_page
    })
    if (current_page <= that.data.sum_page) {
      wx.showToast({
        title: '加载中！',
        icon: 'loading',
        duration: 1000
      })
      that.get_data_info();
    } else if (current_page > that.data.sum_page) {
      wx.showToast({
        title: '数据已加载完',
        icon: 'loading',
        duration: 1000
      });
      return;
    }
  }
})