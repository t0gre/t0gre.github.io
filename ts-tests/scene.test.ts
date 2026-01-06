import { expect, test } from 'vitest'
import { setParent, initSceneNode } from "demo-01-ts-webgl/lib/scene";
import { m4fromPositionAndEuler } from 'demo-01-ts-webgl/lib/mat4';
import { POS_ORIGIN, ROT_NONE } from 'demo-01-ts-webgl/lib/vec';

test('setParent updates parent and children correctly', () => {

const childNode = initSceneNode(m4fromPositionAndEuler({x: 1, y: 1, z: 1}, ROT_NONE))
   
const parentNode1 = initSceneNode(m4fromPositionAndEuler(POS_ORIGIN, ROT_NONE))
const parentNode2 = initSceneNode(m4fromPositionAndEuler(POS_ORIGIN, ROT_NONE))

setParent(childNode, parentNode1);

expect(childNode.parent === parentNode1, "child's parent is correct").toBe(true), 
expect(parentNode1.children.includes(childNode), "parent's children to be correct").toBe(true) 

setParent(childNode, parentNode2);

expect(childNode.parent === parentNode2, "child's new parent is correct").toBe(true), 
expect(parentNode2.children.includes(childNode), "new parent's chuldren to be correct").toBe(true) 
expect(!parentNode1.children.includes(childNode), "old parents children to not include the child").toBe(true) 


})