// pages/rule/rule.js
// var WxParse = require('../../wxParse/wxParse.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    details:'',
    article: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    
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
    var that = this;
    var uid = wx.getStorageSync('uid');
    // 推荐线路
    wx.request({
      url: getApp().globalData.url + '/api/home/free_line_api',
      data: {
        uid: uid
      },
      success: res => {
        console.log(res)
        that.setData({
          details: res.data.data.details
        })
        console.log(that.data.details)
        // let contents = res.data.data.details
        // WxParse.wxParse('contents', 'html', contents, that);
        let data = app.towxml.toJson(res.data.data.details, 'markdown');                //设置文档显示主题，默认'light'
        data.theme = 'dark';                //设置数据
        that.setData({
          article: data
        });
      }
    });
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})