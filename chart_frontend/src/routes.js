export var routes = [
  {
    name: "Forward test",
    icon: "tim-icons icon-chart-pie-36",
    instance: "forward_test",
    items: [
      {
        id: 0,
        label: 'System File Manager',
        instance: "systemfilemanager",
        pathname: '/systemfilemanager'
      },
      {
        id: 1,
        label: 'View',
        instance: "view",
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
        instance: "view",
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
        instance: "view",
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
        instance: "view",
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
    items: [
      {
        id: 0,
        label: 'Price Data Table',
        instance: "pricedatatable",
        pathname: '/pricedatatable'
      },
      {
        id: 1,
        label: 'Trade Data Table',
        instance: "tradedatatable",
        pathname: '/tradedatatable'
      }
    ],
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

