import {createHTML} from '../utils/dom-utils';
import Vue from 'vue/dist/vue.esm';
import {strapiSDK} from '../database-utils';

export async function createLoginDialog (onLoginCancel) {
  return new Promise(function (resolve, reject) {
    // let name = prompt('name');
    // let pw = prompt('password');
    // return strapiSDK.login(name, pw);

    const loginTemplate = `
<div style="position: absolute;top: 50%;left: 10%;background-color: rgba(255,255,255,0.5);padding: 2em;" >
   <div v-if="error">{{error}}</div>
    <form id="loginform" v-on:submit.prevent="login">  
        <input required placeholder="user name" autocomplete="username" name="username" type="text" v-model="input.username" />
        <input required placeholder="password"  autocomplete="password"  name="password" type="password" v-model="input.password" />
        <input name="doLogin" type="submit" value="Login" />
    </form>
     <input name="cancel" type="button" value="Cancel" @click="cancel" />
  </div>
  `;

    var el = createHTML(loginTemplate);
    global.document.body.append(el);
    let vm;
    vm = new Vue({
      el: el,
      data: {
        input: {
          username: '',
          password: ''
        },
        error: false
      },
      methods: {

        login (e) {
          console.log('Send method!', this);
          var username = this.input.username;
          var password = this.input.password;
          console.log('Send method!', username, password);

          strapiSDK.login(username, password).then((res) => {
            vm.$el.remove();
            resolve(res);
          }).catch((e) => {
            this.error = e.message;
          });
          return false;
        },
        cancel () {
          vm.$el.remove();
          onLoginCancel();
        }

      }
    });
  });
}
