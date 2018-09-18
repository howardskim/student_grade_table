<?php

//write a query that selects all the students from the database, all the data from each row
$query = "SELECT * FROM `student_data`";
$result = mysqli_query($conn, $query);
//send the query to the database, store the result of the query into $result



//check if $result is empty.  
	//if it is, add 'database error' to errors
	if(empty($result)){
		$output['errors'][] = 'database error';
	} else {
		if(mysqli_num_rows($result) > 0){
			$output['success'] = true;
			//while each row data is being fetched..grab each row that is associated with result; and push it into output['data'];
			while($row = mysqli_fetch_assoc($result)){
				$output['data'][] = $row;
			}
		} else {
			$output['errors'][] = 'no data';
		}
	}
//else: 
	//check if any data came back
		//$output['data']=[];
		//if it did, change output success to true
		//do a while loop to collect all the data 
			//add each row of data to the $output['data'] array
	//if not, add to the errors: 'no data'

?>