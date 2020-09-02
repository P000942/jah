const Typecast = {
	InitMask : false,
	InitSuggest : false,
	
	Init : function(formId){
		let inputs = (formId) ?$(`#${formId}`).find("input") :$("input") ;
		this.Parse(inputs);
		this.Mask.Init();
	},
	
	Parse : function(inputs){ // ler e inicializar todos os inputs ou todos dentro de um elemento
		for(let i=0; i<inputs.length; i++){
		   this.Format(inputs[i]);	
		}
	}
	, Format : function(field, maskProperties){ //inicializa as máscaras dos elemntos
		if(field.type=="text" && dataExt.isDefined(field.getAttribute("data-mask"))  
		                      && dataExt.isDefined(field.Mask)==false){
			if(!field.id) Typecast.Utils.GenerateID(field);
					
			let behaviour     = Typecast.Mask;  
			Typecast.InitMask = true;
			behaviour.initField(field, maskProperties);

			field.onfocus    = behaviour.onFocusHandler;
			field.onkeyup    = behaviour.keyUpHandler;
			field.onkeypress = behaviour.keyPressHandler;
			field.onblur     = behaviour.lostFocusHandler;
			field.onmouseup  = behaviour.mouseUpHandler;
		}            
	}
	, Mask : {
			Init : ()=>{},
			
			initField : (field, maskProperties)=>{ //inicializa as máscaras
				Typecast.Mask.ParseFieldData(field);
				field.value = (field.DefaultText.length>0) ?field.DefaultText.join("") :field.DefaultText;
				if (!maskProperties) {
					if (!field.isAlignRight)
						field.isAlignRight = false;
				}else
					field.isAlignRight = (maskProperties.align==c$.ALIGN.RIGHT) ?true :false;
			},
			
			onFocusHandler : (e=window.event)=>{
				if (e.target.isAlignRight)
				   Typecast.Mask.CursorManager.Reposition(e.target);
			},
			
			lostFocusHandler : ()=>{},
			
			keyUpHandler : function(e=window.event){
				let key = Typecast.Utils.getKey(e)
				  , mask = Typecast.Mask;
				// else if(key.code==c$.KEY.ESC){}
				// else{}
				if (!key.isHandleKey) return;

				if(key.code==c$.KEY.DEL){
					if(this.InsertActive)
						mask.DataManager.RemoveCharacterByShiftLeft(this);
					else
						mask.DataManager.RemoveCharacterByOverwrite(this);
					mask.Render(this);
					if(this.isAlignRight)
						mask.CursorManager.Reposition(this);
				} else if (key.code==c$.KEY.BACKSPACE && (this.AllowInsert || this.isAlignRight)){
					if (this.isAlignRight){
						mask.DataManager.shiftRight(this);
					}else if (this.AllowInsert){
						let preBackspaceCursorPosition = Typecast.Mask.CursorManager.GetPosition(this)[0];
						mask.CursorManager.Move(this, -1);
						let postBackspaceCursorPosition = Typecast.Mask.CursorManager.GetPosition(this)[0]-1;

						if(preBackspaceCursorPosition != postBackspaceCursorPosition) 
							mask.DataManager.RemoveCharacterByShiftLeft(this,1);
					}
					mask.Render(this);
					mask.CursorManager.Reposition(this);
				}else if(key.code==c$.KEY.END){
					let startIdx = Typecast.Mask.MaskManager.FindNearestMaskCharacter(this, this.DataIndex[this.DataIndex.length-1], 1);
					Typecast.Mask.CursorManager.SetPosition(this, startIdx);
				}else if(key.code==c$.KEY.HOME){
					Typecast.Mask.CursorManager.SetPosition(this, this.MaskIndex[0]);
				}else if(key.code==c$.KEY.LEFT || (key.code==c$.KEY.UP && this.isAlignRight==false)){
					mask.CursorManager.Move(this, -1);
				}else if(key.code==c$.KEY.UP && this.isAlignRight){
					mask.CursorManager.Reposition(this);
				}else if(key.code==c$.KEY.RIGHT  || key.code==c$.KEY.DOWN){
					mask.CursorManager.Move(this, 1);
				}else if(key.code==c$.KEY.INS && this.AllowInsert)
					mask.CursorManager.ToggleInsert(this);
				return false;
			},
			keyPressHandler : function(e= window.event){
				let key = Typecast.Utils.getKey(e);
				if (!key.isValidChar) {return}

				let mask = Typecast.Mask
				  , render=false;
				mask.CursorManager.TabbedInSetPosition(this);
				maskCurrent=mask.MaskManager.CurrentMaskCharacter(this);				

				//Numeric Characters
				if ( ((c$.MASK.MaskCharacters.Numeric.includes(maskCurrent)) && key.isDigit) ||
			 	      ((key.isDecimalCharacter) && this.value.includes(c$.MASK.DecimalCharacter)==false && this.value.trim().length>0 && this.hasDecimalCharInMask)) {                                        
						render=true;
				}
				//Alpha Characters 65 - 90
                else if(key.isLetter){
					if (c$.MASK.MaskCharacters.Alpha.includes(maskCurrent)){
						if (maskCurrent==c$.MASK.LowerCaseCharacter){
							key.char=key.char.toLowerCase()
						}else if (maskCurrent==c$.MASK.UpperCaseCharacter){
							key.char=key.char.toUpperCase()
						}                                       
						render=true;
					} else if (this.isAlignRight)
						mask.CursorManager.Reposition(this);
				}
				if (render){
					mask.DataManager.AddData(this, key.char);
					mask.Render(this);
					mask.CursorManager.Reposition(this);
				}
				
				//Refresh
				// else if(key.code==c$.KEY.REFRESH){ return}
				// else{}
				return false;
			},
			mouseUpHandler : function(e=window.event){
				if (this.isAlignRight)
					Typecast.Mask.CursorManager.Reposition(this);
				else{
					let cursorPosition = Typecast.Mask.CursorManager.GetPosition(this)[0];
					let startIdx = Typecast.Mask.MaskManager.FindNearestMaskCharacter(this, cursorPosition, 0);
					Typecast.Mask.CursorManager.SetPosition(this, startIdx);
				}	
			},
			
			ParseFieldData : function(field, fieldData){ //inicializa os valores de dados
				field.CursorPosition= [];
				field.Data          = [];
				field.DataIndex     = [];
				field.DefaultText   = (field.getAttribute("data-prompt")) ?field.getAttribute("data-prompt").split("") :"";

				field.Mask          = this.MaskManager.ParseMask(field);
				field.MaskIndex     = this.MaskManager.ParseMaskIndex(field.Mask);
				
				let IsComplexMask   = this.MaskManager.IsComplexMask(field);
				field.InsertActive  = (IsComplexMask) ? false : true;
				field.HighlightChar = (IsComplexMask) ? true  : false;
				field.AllowInsert   = (IsComplexMask) ? false : true;
			},
			
			MaskManager : {
				ParseMask : function(field){                                        
					let arr =[]
					  , mask=field.getAttribute("data-mask")
					  , maskCharacters = Object.values(c$.MASK.MaskCharacters).join(""); // juntas os caracteres de mascara em uma string
					mask.split("").forEach((item,idx)=>{
														if (maskCharacters.includes(item)) 
														   arr[idx]=item;
													  })
					field.hasDecimalCharInMask=mask.includes(c$.MASK.DecimalCharacter);
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
					let cursorPosition = Typecast.Mask.CursorManager.GetPosition(field)[0];
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
					if (!field.isAlignRight || (field.isAlignRight && field.Data.length>0)){
						let startIdx = Typecast.Mask.MaskManager.FindNearestMaskCharacter(field, cursorPosition, dir);
						this.SetPosition(field, startIdx);
					}else{
						this.SetPosition(field, cursorPosition);
					}
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
					let mask = Typecast.Mask;
					
					if(mask.MaskManager.CurrentMaskCharacter(field) == undefined){
						let startIdx=0;
						if (field.isAlignRight){
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
					field.CursorPosition = this.GetPosition(field);
				},
				RestorePosition : function(field){
					this.SetPosition(field, field.CursorPosition[0]);
				},
				Reposition: function(field){
					if (field.isAlignRight){
						let pos = (field.Mask.length);//(field.Data.join("").length +(field.hasDecimalCharInMask ?1 :0))
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
					let cursorPosition = Typecast.Mask.CursorManager.GetPosition(field)[0];
					if (field.isAlignRight){
						if (cursorPosition ==field.MaskIndex.length)
						   this.InsertCharacter(field, char);
						else
						   this.OverwriteCharacter(field, char, cursorPosition);
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
				InsertCharacter :function(field, char){
					let lastCharacterPosition = field.MaskIndex[field.MaskIndex.length-1];
					let currentCharacterPosition = this.CurrentDataIndexPosition(field);
					if (field.isAlignRight)
						this.shiftLeft(field);
					else
					     this.shift(field,lastCharacterPosition, (lastCharacterPosition-currentCharacterPosition));			
					field.Data[field.MaskIndex[currentCharacterPosition]] = char;
				},
				OverwriteCharacter : function(field, char, cursorPosition){
					field.Data[cursorPosition] = char;
				},
				RemoveCharacterByOverwrite : function(field){
					let currentCharacterPosition = this.CurrentDataIndexPosition(field);
					if(currentCharacterPosition != null){
						if (field.isAlignRight)
						    this.shiftRight(field,currentCharacterPosition)
						else
						   field.Data[field.DataIndex[currentCharacterPosition]] = "";
					}
				},
				RemoveCharacterByShiftLeft : function(field, pos=0){
					let lastCharacterPosition = field.DataIndex[field.DataIndex.length-1]
					  , currentCharacterPosition = this.CurrentDataIndexPosition(field)
					  , cursorPosition = Typecast.Mask.CursorManager.GetPosition(field)[0];
					
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
					let cursorPosition = Typecast.Mask.CursorManager.GetPosition(field)[0];
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
				let composite = [];
				const Pos = index =>({
					index
					, get:()=> ++index					    
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
		// },
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
		},
		getKey: e=>{
			let code=(window.event)?parseInt(e.keyCode):e.which
			code=(code==0)?parseInt(e.which):code;
			let char= String.fromCharCode(code)
			, isDigit = false
			, isLetter = false
			, isDecimalCharacter = false
			, isHandleKey = false
			if (char.isDigit()) isDigit	=true
			else if (char.isLetter()) isLetter=true 
			else if ((key==c$.MASK.DecimalCharacter)) 
			     isDecimalCharacter=true;
			if ([c$.KEY.INS, c$.KEY.DEL, c$.KEY.BACKSPACE, c$.KEY.END, c$.KEY.HOME, c$.KEY.UP, c$.KEY.DOWN, c$.KEY.LEFT, c$.KEY.RIGHT].includes(code)) 
				isHandleKey = true;
			return {code, char, isDigit, isLetter, isDecimalCharacter, isHandleKey, isValidChar: (isDigit || isLetter || isDecimalCharacter)}
		}	
	}
}
