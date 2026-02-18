import { AppRegistry } from 'react-native';
import App from '../App';
import { name as appName } from '../package.json';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
    rootTag: document.getElementById('root'),
});
