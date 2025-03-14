import {
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";

//TAKE AN ARRAY OF ACTIONS BUTTONS AS FOLLOWS:
// * custom_id, e.g. "join_button_{$gameId}"
// * label, e.g. "Join Game"
// * style, e.g. "PRIMARY"
const actionRow = (actionsArr) => {
  let actionRowObj = {
    type: MessageComponentTypes.ACTION_ROW,
    components: []
  };
  
  for(let i = 0; i < actionsArr.length; i++){
    let thisAction = actionsArr[i];
    let thisActionObj = {
      type: MessageComponentTypes.BUTTON,
      // Append the game ID to use later on
      custom_id: thisAction.custom_id,
      label: thisAction.label,
      //style: ButtonStyleTypes.`{thisAction.buttonStyle}`,
      style: thisAction.buttonStyle
    };
    actionRowObj.components.push(thisActionObj);
    return actionRowObj;
  }
}
