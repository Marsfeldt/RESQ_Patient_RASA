/**
 * @format
 */

import {AppRegistry} from 'react-native';

import App from './src/App';
import {name as appName} from './app.json';
import { request } from 'https';
import * as fcl from "@onflow/fcl";
AppRegistry.registerComponent(appName, () => App);
