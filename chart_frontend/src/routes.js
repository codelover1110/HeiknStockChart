export var routes = [
  {
    name: "Forward test",
    icon: "tim-icons icon-chart-pie-36",
    instance: "forward_test",
    items: [
      {
        id: 1,
        label: 'System File Manager',
        pathname: '/'
      },
      {
        id: 0,
        label: 'View',
        pathname: '/'
      }
    ],
  },
  {
    name: "Stress test",
    icon: "tim-icons icon-attach-87",
    instance: "stress_test",
    items: [
      {
        id: 0,
        label: 'View',
        pathname: '/'
      }
    ],
  },
  {
    name: "Optimization",
    icon: "tim-icons icon-atom",
    instance: "optimization",
    items: [
      {
        id: 0,
        label: 'View',
        pathname: '/'
      }
    ],
  },
  {
    name: "Live trading",
    icon: "tim-icons icon-badge",
    instance: "live_trading",
    items: [
      {
        id: 0,
        label: 'View',
        pathname: '/'
      }
    ],
  },
  {
    name: "Scanner",
    icon: "tim-icons icon-camera-18",
    instance: "scanner",
    pathname: '/scanner'
  },
  {
    name: "Data Tables",
    icon: "tim-icons icon-chart-bar-32",
    instance: "trade_data",
    pathname: "/tradedata"
  },
]

export var adminRoutes = [
  // {
  //   name: "User Manage",
  //   icon: "tim-icons icon-chart-pie-36",
  //   instance: "usermanage",
  //   pathname: '/admin/usermanage'
  // },
  {
    name: "Link Manage",
    icon: "tim-icons icon-attach-87",
    instance: "linkmanage",
    pathname: '/admin/linkmanage'
  },
]

