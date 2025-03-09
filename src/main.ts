import { createApp } from 'vue';
import App from './App.vue'
import { router } from './router';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import ToggleSwitch from 'primevue/toggleswitch';
import Toast from "primevue/toast";
import Button from "primevue/button";
import SelectButton from 'primevue/selectbutton';
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import PanelMenu from 'primevue/panelmenu';
import Drawer from "primevue/drawer";
import Card from "primevue/card";
import Menu from 'primevue/menu';
import Toolbar from "primevue/toolbar";
import TieredMenu from 'primevue/tieredmenu';
import FloatLabel from 'primevue/floatlabel';
import DataView from 'primevue/dataview';
import StyleClass from "primevue/styleclass";
import Ripple from "primevue/ripple";
import InputText from 'primevue/inputtext';
import Checkbox from "primevue/checkbox";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Dialog from "primevue/dialog";
import ConfirmationService from 'primevue/confirmationservice';
import VueApexCharts from "vue3-apexcharts";
import { definePreset } from '@primevue/themes';

// Static
import Aura from '@primevue/themes/aura';
import './assets/main.scss';

createApp(App)
    .use(router)
    .use(PrimeVue, {
      theme: {
        preset: definePreset(Aura, {
          semantic: {
            primary: {
              50: '{sky.50}',
              100: '{sky.100}',
              200: '{sky.200}',
              300: '{sky.300}',
              400: '{sky.400}',
              500: '#4AB3FE',
              600: '{sky.600}',
              700: '{sky.700}',
              800: '{sky.800}',
              900: '{sky.900}',
              950: '{sky.950}'
            }
          }
        }),
        options: {
          prefix: 'p',
          darkModeSelector: '.my-app-dark',
          cssLayer: {
            name: 'primevue',
            order: 'app-styles, primevue, another-css-library'
          }
        }
      },
      pt: {
        datatable: {
          root: {
            class: 'p-datatable-striped'
          }
        }
      }
    })
    .use(ToastService)
    .use(ConfirmationService)
    .component('VueApexCharts', VueApexCharts)
    .component('Drawer', Drawer)
    .component('Card', Card)
    .component('Menu', Menu)
    .component('Toolbar', Toolbar)
    .component('TieredMenu', TieredMenu)
    .component('DataView', DataView)
    .component('Column', Column)
    .component('Button', Button)
    .component('SelectButton', SelectButton)
    .component('DataTable', DataTable)
    .component('ToggleSwitch', ToggleSwitch)
    .component('InputText', InputText)
    .component('Checkbox', Checkbox)
    .component('IconField', IconField)
    .component('InputIcon', InputIcon)
    .component("Toast", Toast)
    .component("PanelMenu", PanelMenu)
    .component("Dialog", Dialog)
    .component("FloatLabel", FloatLabel)
    .directive('tooltip', Tooltip)
    .directive('styleClass', StyleClass)
    .directive('ripple', Ripple)
    .mount('#app');
