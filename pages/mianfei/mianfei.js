// pages/mianfei/mianfei.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    autoplay: true,
    interval: 2000,
    duration: 1000,
    vertical:true,
    chouj1:'',
    chouj2:'',
    user_score:'',
    jindu1:50,
    jindu2: 20,
    zj_lst:[],
    shouci: false,
    my_uid: '',
    lunbo:[],
    details:'',
    current_page: 1,
    position: 'auto',
    sum_page: 1,
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
      console.log('为空')
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
              // console.log(res)
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
    }
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
  get_info: function () {
    console.log("获取信息开始");
    var that = this;
    wx.request({
      url: getApp().globalData.url + '/api/home/personal_api',
      data: {
        uid: wx.getStorageSync('uid')
      },
      success: res => {
        console.log("获取信息");
        console.log(res.data.data.user_info)
        that.setData({
          my_info: res.data.data.user_info
        })
      }
    });
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
  // 首次进来的授权弹框关闭按钮
  qvxiao: function () {
    var that = this;
    that.setData({
      shouci: false
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that=this;
    that.get_data_info()
    var isphone = wx.getStorageSync('isphone');
    // var uid = wx.getStorageSync('uid');
    // wx.request({
    //   url: getApp().globalData.url + '/api/home/free_line_api',
    //   data:{
    //     uid:uid
    //   },
    //   success: res => {
    //     console.log(res)
    //     that.setData({
    //       chouj1: res.data.data.cj1,
    //       chouj2: res.data.data.cj2,
    //       user_score:res.data.data.user_score,
    //       zj_lst: res.data.data.zj_lst,
    //       lunbo: res.data.data.lunbo,
    //       details: res.data.data.details
    //     })
    //     // console.log(that.data.chouj1)
    //   }
    // });
  },
  get_data_info: function () {
    var that = this;
    var uid = wx.getStorageSync('uid');
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: getApp().globalData.url + '/api/home/free_line_api',
      data: {
        uid: uid,
        page: that.data.current_page,
        pagesize: 8
      },
      success: function (data) {
        console.log(data)
        wx.hideLoading();
        if (data.data.code == 1) {
          if (that.data.current_page == 1) {
            that.setData({
              chouj1: data.data.data.cj1,
              chouj2: data.data.data.cj2,
              user_score: data.data.data.user_score,
              zj_lst: data.data.data.zj_lst,
              lunbo: data.data.data.lunbo,
              details: data.data.data.details,
              sum_page: data.data.data.totalpage
            })
          } else {
            var new_page_cont = that.data.zj_lst;
            var current_guide_list = data.data.data.zj_lst;
            for (var i = 0; i < current_guide_list.length; i++) {
              new_page_cont.push(current_guide_list[i])
            }
            that.setData({
              zj_lst: new_page_cont
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
  mian_xiang:function(e){
    var that=this;
    console.log(e)
    wx.navigateTo({
      url: '/pages/mian_xiang/mian_xiang?route_id=' + e.currentTarget.dataset.route_id + '&user_score=' + that.data.user_score + '&id=' + e.currentTarget.dataset.id + '&total_amount=' + e.currentTarget.dataset.total_amount
    })
  },
  kai_xiang:function(e){
    var that = this;
    console.log(e)
    if (e.currentTarget.dataset.isdel==1){
      wx.showToast({
        title: '该线路已下架',
        icon:'none'
      })
      return;
    }else{
      wx.navigateTo({
        url: '/pages/kai_xiang/kai_xiang?zj_id=' + e.currentTarget.dataset.zj_id
      })
    }
  },
  rule:function(){
    var that=this;
    wx.navigateTo({
      url: '/pages/rule/rule'
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this;
    wx.stopPullDownRefresh();
    that.setData({
      zj_lst: [],
      current_page: 1,
      sum_page: 1
    })
    that.get_data_info();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (e) {
    var that = this;
    var current_page = null;
    current_page = that.data.current_page + 1;
    // console.log(current_page)
    // console.log(that.data.sum_page)
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
  },

})