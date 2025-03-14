import { DatabaseManager } from '../mongodb/DatabaseManager.js';

const DbMgr = new DatabaseManager();
//DbMgr.run().catch(console.dir);

let record = {
  name: 'a test',
  discordId: 'ae284'
}
let newData = [
  {
    name: 'Testy1',
    discordId: 'test1'
  },
  {
    name: 'Test2',
    discordId: 'tesstttt2'
  }
];

const testType = 'store';
switch(testType){
  case 'insert':
    DbMgr.insert('games', 'players', record);
  break;
  case 'store':
    DbMgr.store('games', 'players', record);
  break;
  case 'retrieve':
    let result = DbMgr.retrieve('games', 'players', record);
    console.log(result);
  break;
}