function generateInstructions() {
			// create the list of tree bulding instructions
			var generation = treeDef.start;
			// go over the number of epochs
			for (var i = 0; i < treeDef.numEpochs; i++) {
				var temp = '';
				// generate a new list for each generation
				for (var j = 0; j < generation.length; j++) {
					var spawn = treeDef.rules[generation[j]]; // get the spawned sybols
					temp += spawn;
				}
				console.log(temp);
				generation = temp; // a new generation
			}
			return generation;
		}


		// Tree is where we build the tree
		function Tree() {
			var instructions = generateInstructions();
			var treeGroup = new THREE.Group();
			var stackA = [];
			var stackV = []; // store positions and angles
			var startpoint = new THREE.Vector3(); // draw from
			var endpoint = new THREE.Vector3(); // draw to
			var angle = new THREE.Vector3(0, 0, 0); // at an angle

			var limb = new THREE.Vector3(0.5, 3.5, 0.5); // a tree segment
			var levelUp = true;
			// go through the generated instruction set
			for (var i = 0; i < instructions.length; i++) {
				var t = instructions[i];
				switch (t) {
					case '+':
						angle.z -= treeDef.angle;
						break;
					case '-':
						angle.z += treeDef.angle;
						break;
					case ';':
						angle.x += treeDef.angle + 25;
						break;
					case ':':
						angle.x -= treeDef.angle;
						break;
					case '[': // memorize current state
						stackV.push(startpoint.clone());
						stackA.push(angle.clone());
						levelUp = true;
						break;
					case ']': // remeber previous state
						if (levelUp) {
							drawBud();
							levelUp = false;
						}
						var point = stackV.pop();
						startpoint.copy(point);
						var a = stackA.pop();
						angle.copy(a);
						break;
					case 'F': // draw forward
						// create the endpoint based on euler angle
						var a = new THREE.Euler(angle.x, angle.y, angle.z, 'XYZ');
						var rotator = limb.clone().applyEuler(a);
						endpoint.addVectors(startpoint, rotator);
						var bit = Limb();
						bit.position.copy(startpoint);
						bit.rotation.x = angle.x;
						bit.rotation.y = angle.y;
						bit.rotation.z = angle.z;
						treeGroup.add(bit);
						startpoint.copy(endpoint); // the next start point
						break;
					default:
						break;
				} // end switch
			} // end for

			// inner function to draw leaf
			// called at pop
			function drawBud() {
				var bud = Bud();
				bud.position.copy(startpoint);
				bud.rotation.x = angle.x;
				bud.rotation.y = angle.y;
				//bud.position.x += 2;
				//bud.position.y += 2;
				bud.castShadow = true;
				treeGroup.add(bud);
			}
			return treeGroup;
		}

		function Limb() {
			var height = 5;
			var geometry = new THREE.BoxGeometry(1, height, 1);
			geometry.translate(2, height / 2, 0);
			var mat = new THREE.MeshPhongMaterial({
				color: 0x4E342E
			});
			var mesh = new THREE.Mesh(geometry, mat);
			mesh.castShadow = true;
			return mesh;
		}

		function Bud() {
			var geometry = new THREE.IcosahedronGeometry(5, 0);
			var mat = new THREE.MeshPhongMaterial({
				color: 0x80aa33,
				shading: THREE.FlatShading
			});
			var mesh = new THREE.Mesh(geometry, mat);
			mesh.castShadow = true;
			return mesh;
		}
