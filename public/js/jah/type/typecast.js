/*
Typecast 1.4 (release)
by Ara Pehlivanian (http://arapehlivanian.com)

This work is licensed under a Creative Commons Licence
http://creativecommons.org/licenses/by-nd/2.5/
*/

const Typecast = {
	InitMask : false,
	InitSuggest : false,
	
	Init : function(){
		this.Parse(document.body.getElementsByTagName("input"));
		this.Behaviours.Mask.Init();
	//	this.Behaviours.Suggest.Init();
	},
	
	Parse : function(nodes){
		
		for(let i=0; i<nodes.length; i++){
		   this.Format(nodes[i]);	
		}
	}
        , Format : function(field, maskProperties){
			if(field.type=="text" && field.className && field.className.indexOf("TC") != -1){
				if(!field.id) Typecast.Utils.GenerateID(field);
				
				let behaviourName = (field.className.indexOf("[") != -1) ? field.className.substring(field.className.indexOf("TC")+2, field.className.indexOf("[")) : field.className.substring(field.className.indexOf("TC")+2, field.className.length);
				let behaviour     = Typecast.Behaviours[behaviourName]
				Typecast["Init" + behaviourName] = true;
				behaviour.InitField(field);

				field.onfocus    = behaviour.Run;
				field.onkeyup    = behaviour.KeyUpHandler;
				field.onkeypress = behaviour.KeyHandler;
				field.onblur     = behaviour.Stop;
				field.onmouseup  = behaviour.MouseUp;
				if (!maskProperties) {
					if (!field.alignToReposiotion)
				       field.alignToReposiotion = c$.ALIGN.LEFT;
				}else
				   field.alignToReposiotion =maskProperties.align;
			}            
        }
	
	, Behaviours : {
		Mask : {
			Init : ()=>{},
			
			InitField : field=>{
				let fieldData = [];
				let fld = (c$.MASK.MASKS[field.id])?c$.MASK.MASKS[field.id]:null;
				if(!fld){
					fieldData = field.className.substring(field.className.indexOf("[")+1, field.className.indexOf("]"))
				}else{
					fieldData = fld;//eval("c$.MASK.MASKS." + field.id);
				}
				Typecast.Behaviours.Mask.ParseFieldData(field, fieldData);
                                // By Geraldo - antes retornava direto field.DefaultText.join("")
				field.value = (field.DefaultText.length>0)?field.DefaultText.join(""):field.DefaultText;
			},
			
			Run : (e=window.event)=>{
				if (e.target.alignToReposiotion==c$.ALIGN.RIGHT)
				   Typecast.Behaviours.Mask.CursorManager.Reposition(e.target);
			},
			
			Stop : ()=>{},
			
			KeyUpHandler : function(e=window.event){
				//e = (!e) ? window.event : e;
				let keyNum=(window.event)?parseInt(e.keyCode):e.which
				  , mask = Typecast.Behaviours.Mask;
				if(keyNum==c$.KEY.ENTER){
				   return
                }else if(keyNum==c$.KEY.ESC){}
				else{}
				if(keyNum==c$.KEY.DEL){
					if(this.InsertActive){
						mask.DataManager.RemoveCharacterByShiftLeft(this);
					}else{
						mask.DataManager.RemoveCharacterByOverwrite(this);
					}
					mask.Render(this);
				}
				if(keyNum==c$.KEY.BACKSPACE && (this.AllowInsert || this.alignToReposiotion==c$.ALIGN.RIGHT)){
					if (this.alignToReposiotion==c$.ALIGN.RIGHT){
						mask.DataManager.shiftRight(this);
					}else if (this.AllowInsert){
						let preBackspaceCursorPosition = Typecast.Behaviours.Mask.CursorManager.GetPosition(this)[0];
						mask.CursorManager.Move(this, -1);
						let postBackspaceCursorPosition = Typecast.Behaviours.Mask.CursorManager.GetPosition(this)[0]-1;

						if(preBackspaceCursorPosition != postBackspaceCursorPosition) 
							mask.DataManager.RemoveCharacterByShiftLeft(this,1);
					}
					mask.Render(this);
						//mask.CursorManager.Move(this, 1);
					mask.CursorManager.Reposition(this);
				}
				return false;
			},
			KeyHandler : function(e= window.event){
				//e = (!e) ? window.event : e;
				let mask = Typecast.Behaviours.Mask;

				mask.CursorManager.TabbedInSetPosition(this);

				keyNum=parseInt(e.keyCode)
				keyNum=(keyNum==0)?parseInt(e.which):keyNum;
				maskCurrent=mask.MaskManager.CurrentMaskCharacter(this);

				keychar = String.fromCharCode(keyNum)

                                // console.log('EVENT:'+e.type+'; which:' +e.which + '; keyCode:' + e.keyCode  + '; keynum:' + keyNum+'; keyChar:'+keychar+' maskCurrent:'+maskCurrent);

				// if(keyNum==c$.KEY.BACKSPACE && this.AllowInsert){
				// 	var preBackspaceCursorPosition = Typecast.Behaviours.Mask.CursorManager.GetPosition(this)[0];
				// 	mask.CursorManager.Move(this, -1);
				// 	var postBackspaceCursorPosition = Typecast.Behaviours.Mask.CursorManager.GetPosition(this)[0];

				// 	if(preBackspaceCursorPosition != postBackspaceCursorPosition) mask.DataManager.RemoveCharacterByShiftLeft(this,1);
				// 	mask.Render(this);
				// 	mask.CursorManager.Move(this, 1);
				// }

				if(keyNum==c$.KEY.TAB){return}

				else if(keyNum==c$.KEY.END){
					let startIdx = Typecast.Behaviours.Mask.MaskManager.FindNearestMaskCharacter(this, this.DataIndex[this.DataIndex.length-1], 1);
					Typecast.Behaviours.Mask.CursorManager.SetPosition(this, startIdx);
				}else if(keyNum==c$.KEY.HOME){
					Typecast.Behaviours.Mask.CursorManager.SetPosition(this, this.MaskIndex[0]);
				}else if(keyNum==c$.KEY.LEFT || keyNum==c$.KEY.UP){
					mask.CursorManager.Move(this, -1);
				}else if(keyNum==c$.KEY.RIGHT  || keyNum==c$.KEY.DOWN){
					mask.CursorManager.Move(this, 1);
				}else if(keyNum==c$.KEY.INS && this.AllowInsert){
					mask.CursorManager.ToggleInsert(this);
				}else if(keyNum==c$.KEY.DEL){
					if(this.InsertActive){
						mask.DataManager.RemoveCharacterByShiftLeft(this);
					}else{
						mask.DataManager.RemoveCharacterByOverwrite(this);
					}
					mask.Render(this);
				}
				//Numeric Characters
				//else if((mask.MaskManager.CurrentMaskCharacter(this) == Typecast.Config.Settings.Mask.MaskCharacters.Numeric) && (e.keyCode>=48 && e.keyCode<=57 && e.type=="keydown" || e.keyCode>=96 && e.keyCode<=105 && e.type=="keydown")){
                                //else if((Typecast.Config.Settings.Mask.MaskCharacters.Numeric.indexOf(maskCurrent)!=-1) && (keyNum>=48 && keyNum<=57)){
                else if((c$.MASK.MaskCharacters.Numeric.indexOf(maskCurrent)!=-1) && (keychar.isDigit()) ||
                        (keychar==c$.MASK.DecimalCharacter) && this.value.indexOf(c$.MASK.DecimalCharacter)==-1 && this.value.trim().length>0 && this.hasDecimalCharacter) {                                        
					mask.DataManager.AddData(this, keychar);
					mask.Render(this);
					//mask.CursorManager.Move(this, 1);
					mask.CursorManager.Reposition(this);
                                        //console.log(this.Mask)
				}
				//Alpha Characters 65 - 90
                                // By Geraldo Gomes
                                //else if((Typecast.Config.Settings.Mask.MaskCharacters.Alpha.indexOf(maskCurrent)!=-1) && (keyNum>=65 && keyNum<=90 || keyNum>=97 && keyNum<=122)){
                else if((c$.MASK.MaskCharacters.Alpha.indexOf(maskCurrent)!=-1) && (keychar.isLetter())){
				     if (maskCurrent==c$.MASK.LowerCaseCharacter){
						keychar=keychar.toLowerCase()
					 }else if (maskCurrent==c$.MASK.UpperCaseCharacter){
						keychar=keychar.toUpperCase()
					 }                                       
					 mask.DataManager.AddData(this, keychar);
					 mask.Render(this);
					 //mask.CursorManager.Move(this, 1);
					 mask.CursorManager.Reposition(this);
				}

				//Refresh
				else if(keyNum==c$.KEY.REFRESH){
					return
				}

				else{
				}
				return false;
			},
			MouseUp : function(e=window.event){
				//e = (!e) ? window.event : e;
				if (this.alignToReposiotion==c$.ALIGN.RIGHT)
					Typecast.Behaviours.Mask.CursorManager.Reposition(this);
				else{
					let cursorPosition = Typecast.Behaviours.Mask.CursorManager.GetPosition(this)[0];
					let startIdx = Typecast.Behaviours.Mask.MaskManager.FindNearestMaskCharacter(this, cursorPosition, 0);
					Typecast.Behaviours.Mask.CursorManager.SetPosition(this, startIdx);
				}	
			},
			
			ParseFieldData : function(field, fieldData){
				fieldData = fieldData.split(c$.MASK.FieldDataSeparator);
				field.Data = [];
				field.DataIndex = [];
                                // By geraldo - no lugar "", retornava fieldData[0].split("")
				field.DefaultText       = (fieldData[1]) ? fieldData[1].split("") : "";//fieldData[0].split(""); //if default text isn't provided use mask
				field.Mask              = this.MaskManager.ParseMask(fieldData[0],field);
				field.MaskIndex         = this.MaskManager.ParseMaskIndex(field.Mask);
				field.CursorPersistance = [];
				let IsComplexMask = this.MaskManager.IsComplexMask(field);
				field.InsertActive      = (IsComplexMask) ? false : true;
				field.HighlightChar     = (IsComplexMask) ? true  : false;
				field.AllowInsert       = (IsComplexMask) ? false : true;
			},
			
			MaskManager : {
				ParseMask : function(mask,field){                                        
					let arr =[];
					let maskCharacters = Object.values(c$.MASK.MaskCharacters).join("") // juntas as mascaras em uma string
					mask.split("").forEach((item,idx)=>{if (maskCharacters.includes(item)) 
						                                   arr[idx]=item;})
					field.hasDecimalCharacter=mask.includes(c$.MASK.DecimalCharacter);
					return arr;
				},
				
				ParseMaskIndex : function(mask){
					let arr = [];
					for(let i=0; i<mask.length; i++){
						if(mask[i] != null) arr[arr.length] = i;
					}
					return arr;
				},
				
				CurrentMaskCharacter : function(field){
					let cursorPosition = Typecast.Behaviours.Mask.CursorManager.GetPosition(field)[0];
					return field.Mask[cursorPosition];
				},
				
				FindNearestMaskCharacter : function(field, cursorPosition, dir){
					let nearestMaskCharacter = (field.DataIndex.length > 0) ? cursorPosition : field.MaskIndex[0];
					
					switch(dir){
						case -1:
							for(let i=field.DataIndex.length-1; i>-1; i--){
								if(field.DataIndex[i] < cursorPosition){
									nearestMaskCharacter = field.DataIndex[i];
									break;
								}
							}
						break;
						case 0:
							for(let i=0; i<field.DataIndex.length; i++){
								if(field.MaskIndex[i] >= cursorPosition){
									nearestMaskCharacter = field.MaskIndex[i];
									break;
								}else{
									nearestMaskCharacter = field.MaskIndex[field.DataIndex.length];
								}
							}							
						break;
						case 1:
							for(let i=0; i<field.DataIndex.length; i++){
								if(field.DataIndex[i] > cursorPosition){
									nearestMaskCharacter = field.DataIndex[i];
									break;
								}
							}
							if(cursorPosition == field.MaskIndex[field.MaskIndex.length-1]) nearestMaskCharacter = cursorPosition + 1;
							else if(cursorPosition == field.DataIndex[field.DataIndex.length-1]) nearestMaskCharacter = field.MaskIndex[field.DataIndex.length];
						break;
					}
					return nearestMaskCharacter
				},
				//Quando a mask contem tipos diferentes de caracteres - não deceverá permitir insert;
				IsComplexMask : function(field){
					let previousChar= "";
					let isComplex = field.MaskIndex.some((cur,i)=>{
						const currentChar = field.Mask[cur];
						const res =  (currentChar != previousChar && previousChar != "")
						previousChar = currentChar;
						return 	res;
					});
					return isComplex;
				}
			},
			
			CursorManager : {
				Move : function(field, dir){
					let cursorPosition = this.GetPosition(field)[0];
					let startIdx = Typecast.Behaviours.Mask.MaskManager.FindNearestMaskCharacter(field, cursorPosition, dir);
					this.SetPosition(field, startIdx);
				},
				GetPosition : function(field){
					let arr = [0,0];
					if(field.selectionStart && field.selectionEnd){
						arr[0] = field.selectionStart;
						arr[1] = field.selectionEnd;
					}
					else if(document.selection){
						let range = field.createTextRange();
						range.setEndPoint("EndToStart", document.selection.createRange());
						arr[0] = range.text.length;
						arr[1] = document.selection.createRange().text.length;
					}
					return arr
				},
				SetPosition : function(field, startIdx){
					let endIdx = startIdx + ((field.HighlightChar) ? 1 : 0);
					Typecast.Utils.PartialSelect(field, startIdx, endIdx);
				},
				TabbedInSetPosition : function(field){//onde será posicionado o cursor para inserir o valor
					let mask = Typecast.Behaviours.Mask;
					
					if(mask.MaskManager.CurrentMaskCharacter(field) == undefined){
						let startIdx=0;
						if (field.alignToReposiotion == c$.ALIGN.RIGHT){
							startIdx =field.MaskIndex.length;
						}else{
							if(field.DataIndex.length > 0 && field.DataIndex.length != field.MaskIndex.length){
								startIdx = field.MaskIndex[field.DataIndex.length];
							}
							else if(field.DataIndex.length == field.MaskIndex.length){
								startIdx = field.DataIndex[field.DataIndex.length-1] + 1;
							}
						}
						this.SetPosition(field, startIdx);
					}
				},
				PersistPosition : function(field){
					field.CursorPersistance = this.GetPosition(field);
				},
				RestorePosition : function(field){
					this.SetPosition(field, field.CursorPersistance[0]);
				},
				Reposition: function(field){
					if (field.alignToReposiotion == c$.ALIGN.RIGHT){
						let pos = (field.Mask.length);//(field.Data.join("").length +(field.hasDecimalCharacter ?1 :0))
						this.SetPosition(field, pos);
					}else{
						this.Move(field, 1);
					}
				},
				ToggleInsert : function(field){
					if(field.InsertActive){
						field.InsertActive = false;
						field.HighlightChar = true;
					}else{
						field.InsertActive = true;
						field.HighlightChar = false;
					}
					let startIdx = this.GetPosition(field)[0];
					this.SetPosition(field, startIdx);
				}
			},
			
			DataManager : {
				AddData : function(field, char){
					//(field.alignToReposiotion==c$.ALIGN.RIGHT)
					let cursorPosition = Typecast.Behaviours.Mask.CursorManager.GetPosition(field)[0];
					if (field.alignToReposiotion==c$.ALIGN.RIGHT){
						this.InsertCharacter(field, char);
					}else{
						if(field.InsertActive)
							this.InsertCharacter(field, char);
						else
							this.OverwriteCharacter(field, char, cursorPosition);
					}
					this.UpdateDataIndex(field);
				},
				shiftLeft: (field) =>{ // move todos para esquerda uma posicao
					if (field.Data.length>0){
						for(let i=0;i<field.MaskIndex.length;i++){
							field.Data[field.MaskIndex[i]] = field.Data[field.MaskIndex[i+1]];
						}
					}
				},
				shift: (field,start=0, ct=1) =>{ // move todos para direita uma posicao
					if (field.Data.length>0){
						for(let i=start; i<start-ct; i--){
							field.Data[field.MaskIndex[i+1]] = field.Data[field.MaskIndex[i]];
						}
					}
				},
				shiftRight: (field,start=field.MaskIndex.length-1) =>{ // move todos para direita uma posicao
					if (field.Data.length>0){
						for(let i=start; i>-1; i--){
							field.Data[field.MaskIndex[i]] = field.Data[field.MaskIndex[i-1]];
						}
					}
				},
				InsertCharacter : function(field, char){
					let lastCharacterPosition = field.MaskIndex[field.MaskIndex.length-1];
					let currentCharacterPosition = this.CurrentDataIndexPosition(field);
					if (field.alignToReposiotion==c$.ALIGN.RIGHT){
						this.shiftLeft(field);
					}else
					     this.shift(field,lastCharacterPosition, (lastCharacterPosition-currentCharacterPosition));
					// for(let i=lastCharacterPosition; i>=currentCharacterPosition; i--){
					// 	field.Data[field.MaskIndex[i+1]] = field.Data[field.MaskIndex[i]];
					// }
					field.Data[field.MaskIndex[currentCharacterPosition]] = char;
				},
				OverwriteCharacter : function(field, char, cursorPosition){
					field.Data[cursorPosition] = char;
				},
				RemoveCharacterByOverwrite : function(field){
					let currentCharacterPosition = this.CurrentDataIndexPosition(field);
					if(currentCharacterPosition != null){
						field.Data[field.DataIndex[currentCharacterPosition]] = "";
					}
				},
				RemoveCharacterByShiftLeft : function(field, pos=0){
					let lastCharacterPosition = field.DataIndex[field.DataIndex.length-1]
					  , currentCharacterPosition = this.CurrentDataIndexPosition(field)
					  , cursorPosition = Typecast.Behaviours.Mask.CursorManager.GetPosition(field)[0];
					
					if(currentCharacterPosition != null && (lastCharacterPosition >= cursorPosition || (lastCharacterPosition ==0  && lastCharacterPosition == cursorPosition))){
						if (lastCharacterPosition ==0)
						    field.Data[field.DataIndex[0]] = field.Data[field.DataIndex[1]];
						else{
							for(let i=(currentCharacterPosition+pos); i<=lastCharacterPosition; i++){
								field.Data[field.DataIndex[i]] = field.Data[field.DataIndex[i+1]];
							}
						}	
						field.Data.length = field.Data.length-1;
						this.UpdateDataIndex(field);
					}
				},
				UpdateDataIndex : function(field){
					field.DataIndex.length = 0;
					for(let i=0; i<field.Data.length; i++){
						if(field.Data[i] != undefined) field.DataIndex[field.DataIndex.length] = i;
					}
				},
				CurrentDataIndexPosition : function(field){
					let cursorPosition = Typecast.Behaviours.Mask.CursorManager.GetPosition(field)[0];
					let currentDataIndexPosition = null;
					for(let i=0; i<field.MaskIndex.length; i++){
						if(field.MaskIndex[i] == cursorPosition){
							currentDataIndexPosition = i;
							break;
						}
					}
					return currentDataIndexPosition
				}				
			},
			
			Render : function(field){
				this.CursorManager.PersistPosition(field);
				let composite = []//, idx=((field.alignToReposiotion==c$.ALIGN.RIGHT)?field.Mask.length:-1);
				const Pos = index =>({
					index
					, get:()=> ++index
					    //(field.alignToReposiotion==c$.ALIGN.RIGHT) ?--index :++index
				})
				const pos=Pos(-1);
				for(let i=0; i<field.Mask.length; i++){
					let k = pos.get();
					if (field.DefaultText.length>0){
						composite[i] = field.Mask[i];
						if (field.DefaultText[i]) 
						    composite[i] = field.DefaultText[i];
					}
					if (field.Data[k]) 
					   composite[i] = field.Data[k];
				}
				field.value = composite.join("")
				
				this.CursorManager.RestorePosition(field);
			}
		},
	},
	
	Utils : {
		GenerateID : function(obj){
			dt = new Date();
			obj.id = "GenID" + dt.getTime();
			return obj
		},
		PartialSelect : function(field, startIdx, endIdx){
			if(field.createTextRange){
				let fld= field.createTextRange();
				fld.moveStart("character", startIdx);
				fld.moveEnd("character", endIdx - field.value.length);
				fld.select();
			}else if(field.setSelectionRange){
				field.setSelectionRange(startIdx, endIdx);
			}
		}		
	}
}
