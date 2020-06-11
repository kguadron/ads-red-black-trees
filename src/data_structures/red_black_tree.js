// Exported for the tests :(
export class RBTNode {
  static BLACK = 'black';
  static RED = 'red';
  static sentinel = Object.freeze({ color: RBTNode.BLACK });

  constructor({
    key, value,
    color = RBTNode.RED,
    parent = RBTNode.sentinel,
    left = RBTNode.sentinel,
    right = RBTNode.sentinel,
  }) {
    this.key = key;
    this.value = value;
    this.color = color;
    this.parent = parent;
    this.left = left;
    this.right = right;
  }
}

class RedBlackTree {
  constructor(Node = RBTNode) {
    this.Node = Node;
    this._count = 0;
    this._root = undefined;
  }

  lookup(key) {
    // tree is empty
    if (this._root === undefined) {
      return undefined;
    }

    let node = this._root;
    while (node.key) {
      if (key > node.key) {
        node = node.right;
      } else if (key < node.key) {
        node = node.left;
      } else {  // found value
        return node.value;
      }
    }
    // did not find the value
    return undefined;
  }
  /**
   * The two rotation functions are symetric, and could presumably
   * be collapsed into one that takes a direction 'left' or 'right',
   * calculates the opposite, and uses [] instead of . to access.
   * 
   * Felt too confusing to be worth it. Plus I bet* the JIT optimizes two
   * functions with static lookups better than one with dynamic lookups.
   * 
   * (*without any evidence whatsoever, 10 points to anyone who tries it out)
   */
  _rotateLeft(node) {
    const child = node.right;

    if (node === RBTNode.sentinel) {
      throw new Error('Cannot rotate a sentinel node');
    } else if (child === RBTNode.sentinel) {
      throw new Error('Cannot rotate away from a sentinal node');
    }

    // turn child's left subtree into node's right subtree
    node.right = child.left;
    if (child.left !== RBTNode.sentinel) {
      child.left.parent = node;
    }

    // link node's parent to child
    child.parent = node.parent;
    if (node === this._root) {
      this._root = child;
    } else if (node === node.parent.left) {
      node.parent.left = child;
    } else {
      node.parent.right = child;
    }

    // put node on child's left
    child.left = node;
    node.parent = child;

    // LOOK AT ME
    // I'M THE PARENT NOW
  }

  _rotateRight(node) {
    const child = node.left;

    if (node === RBTNode.sentinel) {
      throw new Error('Cannot rotate a sentinel node');
    } else if (child === RBTNode.sentinel) {
      throw new Error('Cannot rotate away from a sentinal node');
    }

    // turn child's right subtree into node's left subtree
    node.left = child.right;
    if (child.right !== RBTNode.sentinel) {
      child.right.parent = node;
    }

    // link node's parent to child
    child.parent = node.parent;
    if (node === this._root) {
      this._root = child;
    } else if (node === node.parent.right) {
      node.parent.right = child;
    } else {
      node.parent.left = child;
    }

    // put node on child's right
    child.right = node;
    node.parent = child;
  }

  _insertInternal(key, value) {
    let node = this._root;
    let prevNode; 
    let insertedNode = new this.Node({ key: key, value: value });

    // inserting at root
    if (node === undefined) {
      insertedNode.color = RBTNode.BLACK;
      this._count++;
      this._root = insertedNode;
      return insertedNode;
    }

    while (node.key) {
      if (key < node.key) {
        prevNode = node;
        node = node.left;
      } else if (key > node.key) {
        prevNode = node;
        node = node.right;
      } else {
        node.value = value;
        return node;
      }
    }

    insertedNode.parent = prevNode;
    this._count++;

    if (insertedNode.key < prevNode.key) {
      prevNode.left = insertedNode;
      return insertedNode;
    } else {
      prevNode.right = insertedNode;
      return insertedNode;
    }
  }

  _insertRebalance(node) {
    while (node.color === RBTNode.RED && node.parent.color === RBTNode.RED) {
      let parent = node.parent;
      let grandparent = parent.parent;
      
      if (parent === grandparent.left) { //parent is left child
        let uncle = grandparent.right
        if (uncle.color == RBTNode.RED) {
          uncle.color = RBTNode.BLACK;
          parent.color = RBTNode.BLACK;
          grandparent.color = RBTNode.RED;
          node = grandparent;
        } else { // uncle is black
          if (node === parent.left) {
            parent.color = RBTNode.BLACK;
            grandparent.color = RBTNode.RED;
            this._rotateRight(grandparent);
          } else { // node is right cbhild
            parent = node;
            node = node.parent;
            this._rotateLeft(node);
          }
        } 
      } else { // parent is right child
        let uncle = grandparent.left;
        if (uncle.color == RBTNode.RED) {
          uncle.color = RBTNode.BLACK;
          parent.color = RBTNode.BLACK;
          grandparent.color = RBTNode.RED;
          node = grandparent;
        } else { // uncle is black
          if (node === parent.left) {
            parent = node;
            node = node.parent;
            this._rotateRight(node);
          } else { // node is right child
            parent.color = RBTNode.BLACK;
            grandparent.color = RBTNode.RED;
            this._rotateLeft(grandparent);
          }
        }
      }
    }
    this._root.color = RBTNode.BLACK;
  }

  insert(key, value = true) {
    const node = this._insertInternal(key, value);
    this._insertRebalance(node);
  }

  delete(key) {

  }

  count() {
    return this._count;
  }

  forEach(callback) {
    const visitSubtree = (node, callback, i = 0) => {
      if (node && node.key) {
        i = visitSubtree(node.left, callback, i);
        callback({ key: node.key, value: node.value }, i, this);
        i = visitSubtree(node.right, callback, i + 1);
      }
      return i;
    };
    visitSubtree(this._root, callback);
  } 
}


export default RedBlackTree;