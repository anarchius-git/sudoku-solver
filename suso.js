/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Global Variables
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var xFocusRow = -1; //The x coordinate of the current focus entry square
var yFocusCol = -1; //The y coordinate of the current focus entry square

var theBoard=new Array(9);
theBoard[0]=new Array(9);
theBoard[1]=new Array(9);
theBoard[2]=new Array(9);
theBoard[3]=new Array(9);
theBoard[4]=new Array(9);
theBoard[5]=new Array(9);
theBoard[6]=new Array(9);
theBoard[7]=new Array(9);
theBoard[8]=new Array(9);

// Reset the board array
for(i=0; i<9; i++)
{
	for(j=0; j<9; j++)
	{
		theBoard[i][j] = 0;
	}	
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Image Display Update Functions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function displayNumber(xRow, yCol, valNum)
{
// This displays a given number at a particular x,y (x,y are 0 based)
	if ((xRow >=0 && xRow<9) && (yCol >=0 && yCol<9)  && (valNum>=1 && valNum <=9))
	{
		document.getElementById("img-"+xRow+"x"+yCol).src = "images/glass_numbers_" + valNum + ".png";
		theBoard[xRow][yCol] = valNum;
	}
}

function clearNumber(xRow, yCol)
{
// This clears a particular x,y location (x,y are 0 based)
	if ((xRow >=0 && xRow<9) && (yCol >=0 && yCol<9))
	{
		document.getElementById("img-"+xRow+"x"+yCol).src = "images/glass_numbers_0.png";
		theBoard[xRow][yCol] = 0;
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// General Functions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function pause(millis)
{
	var date = new Date();
	var curDate = null;
	do { curDate = new Date(); }
	while(curDate-date < millis);
}

function getGridLow(xy)
{
	return(Math.floor(xy/3)*3);
}

function getGridHigh(xy)
{
	return((Math.floor(xy/3)+1)*3);
}

function eraseMarks(refArray, xRow, yCol, numVal)
{
// This function takes the array, and clears pencil marks assuming that numVal exists on xRow, yCol
	var xGridLow;
	var xGridHigh;
	var yGridLow;
	var yGridHigh;
	var curi;
	var curj;
	
	// Before we do anything, numVal is 1-9, while our Array is 0-8, decrease it by one
	numVal--;
	
	// Clear marks on the row and column
	for(curi=0; curi<9; curi++)
	{
		refArray[curi][yCol][numVal] = 0;
		refArray[xRow][curi][numVal] = 0;
	}
	
	// Clear marks in the specific tri-drent
	xGridLow = getGridLow(xRow);
	xGridHigh = getGridHigh(xRow);
	yGridLow = getGridLow(yCol);
	yGridHigh = getGridHigh(yCol);
	curi = 0;
	curj = 0;

	for(curi=xGridLow; curi<=xGridHigh-1; curi++)
	{
		for(curj=yGridLow; curj<=yGridHigh-1; curj++)
		{
			refArray[curi][curj][numVal] = 0;
		}
	}
}

function clearMarkXY(refArray, xVal, yVal)
{
// This function clears all the marks on a given x,y. Typically run after you just found an answer mark
	var cnt;
	for(cnt=0; cnt<9; cnt++)
	{
		refArray[xVal][yVal][cnt] = 0;
	}
}

function countMarksXY(refArray, xVal, yVal)
{
// This function counts the number of marks for a given x, y coordinates
	var curi;
	var markCount;
	markCount = 0;
	for(curi=0; curi<9; curi++)
	{
		markCount += refArray[xVal][yVal][curi];
	}
	return markCount;
}

function getSingleMarkXY(refArray, xVal, yVal)
{
// This function gets the singleton mark for a given x,y coordinate from the referenced array
// Note this will just return the last value if called for an x,y having more than one mark
	var cnt;
	var tgtMark;
	for(cnt=0; cnt<9; cnt++)
	{
		if(refArray[xVal][yVal][cnt] == 1)
		{
			tgtMark = cnt;
		}
	}
	
	// Translate tgtMark to the base 1 instead of base 0;
	tgtMark++;
	
	return tgtMark;
}

function countMarksCol(refArray,xVal,zVal)
{
// This function takes the x value (col number) and the value searching for, and returns the number of times
// that particular number occurs down the column.
	var cnti;
	var markCount;
	markCount = 0;
	// Bring down zVal to base 0 instead of base 1
	zVal--;
	for(cnti=0; cnti<9; cnti++)
	{
		markCount += refArray[xVal][cnti][zVal];
	}
	return markCount;
}

function getRowForCol(refArray, xVal, zVal)
{
// This function gets the row where there was only one pencilmark for a given value
// Note this will just return the last value if called for an x,y having more than one mark (i.e., in error).
	var cnt;
	var tgtRow;
	// Change the base of the value from 1 to 0 (we use 0 in our array);
	zVal--;
	for(cnt=0; cnt<9; cnt++)
	{
		if(refArray[xVal][cnt][zVal] == 1)
		{
			tgtRow = cnt;
		}
	}
	
	return tgtRow;
}

function countMarksTri(refArray,triX,triY,val)
{
// This function counts the marks for a particular number in a trident, identified as 0,0 through 2,2
// Take one number, then search through the tri-drents counting the number.
	
	var tgtCount;
	// Convert the value to base 0;
	val--;
	// Convert the trident to actual coordinates
	xLow = 3*triX;
	xHigh = 3*(triX+1)-1;
	yLow = 3*triY;
	yHigh = 3*(triY+1)-1;
	tgtCount=0;
	
	//Begin loop
	for(cnti=xLow; cnti<=xHigh; cnti++)
	{
		for(cntj=yLow; cntj<=yHigh; cntj++)
		{
			tgtCount += refArray[cnti][cntj][val]
		}
	}
	
	return tgtCount;
}

function getXYinTri(refArray,triX,triY,val,retTuple)
{
// This function returns the x and y coordinates, where a particular number occurs only once in a tri-drent.
// Of course, the calling program should make sure that there is only one such number.
	
	// Convert the value to base 0;
	val--;
	// Convert the trident to actual coordinates
	xLow = 3*triX;
	xHigh = 3*(triX+1)-1;
	yLow = 3*triY;
	yHigh = 3*(triY+1)-1;
	
	//Begin loop
	for(cnti=xLow; cnti<=xHigh; cnti++)
	{
		for(cntj=yLow; cntj<=yHigh; cntj++)
		{
			if(refArray[cnti][cntj][val] == 1)
			{
				retTuple[0] = cnti;
				retTuple[1] = cntj;
			}
		}
	}
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Event Handler Functions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function setShadowOnFocus(xRow, yCol)
{
//This function will set the global focus variables, and enable the shadow effect to visually show focus
//The shadow effect for an element is enabled, by changing the class name of the corresponding div
//Designed to be generally called by the OnFocus event
	if ((xRow >=0 && xRow<9) && (yCol >=0 && yCol<9))
	{
		xFocusRow = xRow;
		yFocusCol = yCol;
		document.getElementById("div-"+xRow+"x"+yCol).className = "img-shadow";
	}
}

function unsetShadowOnBlur()
{
//This function will disable the shadow effect for the current focus element, and reset the global focus coordinates
//This is done by changing the class name of the corresponding div
//Designed to be generally called by the OnBlur event
	document.getElementById("div-"+xFocusRow+"x"+yFocusCol).className = "img-no-shadow";
	xFocusRow = -1;
	yFocusCol = -1;
}

function changeImageOnKey(e)
{
//This function updates the image, currently in focus, based on the event of the key press
	var keyCode;
	var keyValue;

	//This is to handle the difference between IE and Firefox in dealing with the keycode from the event	
	if(window.event) // IE
	{
		keyCode = e.keyCode;
	}
	else if(e.which) // Netscape/Firefox/Opera
	{
		keyCode = e.which;
	}
	
	// 0 has the key code of 48. 1 is 49 and so on.
	keyValue = keyCode - 48;
	if (keyCode == 32)
	{
		clearNumber(xFocusRow, yFocusCol);
	}
	else if (keyValue>=1 && keyValue<=9)
	{
		displayNumber(xFocusRow, yFocusCol, keyValue);
	}
}

function changeImageOnClick()
{
//This function updates the image, currently infocus, to the next number - rolling to 1 from 9
	var currentImageNum;
	var currentImage;
	currentImage = document.getElementById("img-"+xFocusRow+"x"+yFocusCol).src;
	
	// Extract the number based on the name of the image name from the source parameter
	currentImageNum = currentImage.substring(currentImage.length-5,currentImage.length-4);
	if(currentImageNum ==9)
	{
		currentImageNum = 0
	}
	currentImageNum++;
	
	displayNumber(xFocusRow, yFocusCol, currentImageNum);
}

function changeImageOnDblClick(xRow, yCol)
{
//This function clears the space to 0. Generally triggered by a double click
//Deprecated - too painful at the moment.
	clearNumber(xRow, yCol);
}

function callBoardReset()
{
	for(i=0; i<9; i++)
	{
		for(j=0; j<9; j++)
		{
			// Reset the board array
			theBoard[i][j] = 0;
			// Clear the numbers on the page
			clearNumber(i,j);
		}	
	}
}

function callBoardRefresh()
{
// Make sure that the displayed number is what we have in memory. This function refreshes the page with the array
// Normally, this should not ever produce new numbers on the screen.
	for(i=0; i<9; i++)
	{
		for(j=0; j<9; j++)
		{
			if (theBoard[i][j] != 0)
			{
				displayNumber(i,j, theBoard[i][j]);
			}
			else
			{
				clearNumber(i,j);
			}
		}	
	}
}

function callBoardSolve()
{
	// Create the 3 dimensional pencil marks array
	var pencilMarks=new Array(9);
	for(i=0; i<9; i++){
		pencilMarks[i]=new Array(9);
	}
	for(i=0; i<9; i++){
		for(j=0; j<9; j++){
			pencilMarks[i][j]=new Array(9);
		}
	}
	
	// Initialize the marks to 1. Subsequently, we will start to eraze them
	for(i=0; i<9; i++){
		for(j=0; j<9; j++){
			for(k=0; k<9; k++){
				pencilMarks[i][j][k] = 1;
			}
		}
	}
	console.log(pencilMarks); //Debug
	
	// Erase marks for the filled in values. Erasemarks means that all marks in the corresponding row & column
	// along with those in the same trident are all cleared. This will be a one-time step.
	// While doing this, also make sure that all marks on that particular square are also cleared. Otherwise
	// the return value with over-write existing answers. This is done using clearMarksXY
	var boardNum;
	for(i=0; i<9; i++)
	{
		for(j=0; j<9; j++)
		{
			boardNum = theBoard[i][j];
			if (boardNum != 0)
			{
				//document.write(i+"  "+ j+ "  "+ boardNum+"<br>");
				// - This makes sure that the rows, cols and trident are cleared
				eraseMarks(pencilMarks,i,j,boardNum);
				// - This makes sure that there are no marks on the particular x,y cell
				clearMarkXY(pencilMarks,i,j);
			}
		}
	}
	console.log(pencilMarks); //Debug
	
	
	var answerFound;
	answerFound = true;
	var tmpValue=0;
	var tmpTuple=new Array(2);
	tmpTuple[0]=0;
	tmpTuple[1]=0;
	
	///////////////// The master solving loop
	
	while(answerFound)
	{
	answerFound = false;
		// Identify any blocks where there is only one pencil mark. If so, accept it as the answer and update.

		for(i=0; i<9; i++)
		{
			for(j=0; j<9; j++)
			{
				if (countMarksXY(pencilMarks,i,j) == 1)
				{
					//alert("only one pencil mark " + i +", "+ j); // Debug
					// identify the specific mark and move it to the board.
					tmpValue = getSingleMarkXY(pencilMarks,i,j);
					theBoard[i][j] = tmpValue;
					// Clear all marks on that xy
					clearMarkXY(pencilMarks,i,j);
					// Erase for the newly identified answer
					eraseMarks(pencilMarks,i,j,tmpValue);
					//alert(tmpValue); // Debug
					answerFound = true;
					tmpValue = 0;
				}
			}
		}

		// Identify any numbers occuring singly in a given column. If so accept it as answer for the block and update.
		for(i=0; i<9; i++)
		{
			// This loop is on the z axis, therefore going from 1 through 9;
			for(j=1; j<=9; j++)
			{
				if (countMarksCol(pencilMarks,i,j) == 1)
				{
					// accept and do housecleaning
					tmpValue = getRowForCol(pencilMarks,i,j);
					theBoard[i][tmpValue] = j;
					// Clear all marks on that xy
					clearMarkXY(pencilMarks,i,tmpValue);
					// Erase for the newly identified answer
					eraseMarks(pencilMarks,i,tmpValue,j);
					//alert(tmpValue); // Debug
					answerFound = true;
					tmpValue = 0;
				}
			}
		}

		// Identify any numbers occuring single in a given tri-drent. Then accept and update.
		for(tx=0; tx<3; tx++)
		{
			for(ty=0; ty<3; ty++)
			{
				// The value is base 1 and not base 0
				for(tval=1; tval<=9; tval++)
				{
					if (countMarksTri(pencilMarks,tx,ty,tval) == 1)
					{
						// We need to get the x and y values. So using an array passed by reference
						// The tmpTuple gets the real x and y coordinates (from the trident of course)
						getXYinTri(pencilMarks,tx,ty,tval,tmpTuple);
						theBoard[tmpTuple[0]][tmpTuple[1]] = tval;
						// Clear all marks on that xy
						clearMarkXY(pencilMarks,tmpTuple[0],tmpTuple[1]);
						// Erase for the newly identified answer
						eraseMarks(pencilMarks,tmpTuple[0],tmpTuple[1],tval);
						//alert(tmpValue); // Debug
						answerFound = true;
						tmpTuple[0] = 0;
						tmpTuple[1] = 0;
					}
				}
			}
		}
	} // End of the master solving While loop.

	callBoardRefresh();

}

function callBoardSave()
{
// This page opens a new window and shows the Sudoku (as it stands now) in a saveable/printable format
	//alert("Saving the Sudoku board has not yet been implemented!");
	if (confirm("This will pop-up a new window showing the puzzle as it stands now. Proceed?"))
	{
		OpenWindow=window.open("", "newwin", "height=400, width=350,toolbar=no,scrollbars="+scroll+",menubar=no");
		OpenWindow.document.write("<html>");
		OpenWindow.document.write("<head>");
		OpenWindow.document.write("<title>Print/Save Sudoku Board</title>");
		OpenWindow.document.write("<link rel='stylesheet' href='style.css' type='text/css' />");
		OpenWindow.document.write("<BODY BGCOLOR=#EEEEEE>");
		OpenWindow.document.write("<div class='div-save-header'>Print/Save Sudoku Board</div>");
		for(j=0; j<9; j++)
		{
			OpenWindow.document.write("<div class='div-save-row'>");
			for(i=0; i<9; i++)
			{
				if(theBoard[i][j] == 0)
				{
					OpenWindow.document.write("<div class='div-save-cell'>.</div>");
				}
				else
				{
					OpenWindow.document.write("<div class='div-save-cell'>"+theBoard[i][j]+"</div>");
				}
			}
			OpenWindow.document.write("</div><div class='div-save-break'></div>");
		}
		OpenWindow.document.write("<br><div class='div-save-text' >Use the [Print] button below, to print the Sudoku board to your printer. Right-click and choose 'Save Page As' to save the page on your machine. Click [Close], when you are done to close this pop-up.</div>")
		OpenWindow.document.write("<br><div class='div-save-row'><div class='div-save-options' OnClick='window.close()'>[Close]</div>")
		OpenWindow.document.write("<div class='div-save-options' OnClick='window.print()'>[Print]</div></div>")
		OpenWindow.document.write("</BODY>")
		OpenWindow.document.write("</HTML>")
		
		OpenWindow.document.close()
		self.name="main"
	}
}

function callBoardLoad()
{
	//alert("Loading a Sudoku board from a file has not yet been implemented!");
	theBoard[0][0] = 8;
	theBoard[3][0] = 9;
	theBoard[4][0] = 3;
	theBoard[8][0] = 2;
	theBoard[2][1] = 9;
	theBoard[7][1] = 4;
	theBoard[0][2] = 7;
	theBoard[2][2] = 2;
	theBoard[3][2] = 1;
	theBoard[6][2] = 9;
	theBoard[7][2] = 6;
	theBoard[0][3] = 2;
	theBoard[7][3] = 9;
	theBoard[1][4] = 6;
	theBoard[7][4] = 7;
	theBoard[1][5] = 7;
	theBoard[5][5] = 6;
	theBoard[8][5] = 5;
	theBoard[1][6] = 2;
	theBoard[2][6] = 7;
	theBoard[5][6] = 8;
	theBoard[6][6] = 4;
	theBoard[8][6] = 6;
	theBoard[1][7] = 3;
	theBoard[6][7] = 5;
	theBoard[0][8] = 5;
	theBoard[4][8] = 6;
	theBoard[5][8] = 2;
	theBoard[8][8] = 8;
	callBoardRefresh();
}