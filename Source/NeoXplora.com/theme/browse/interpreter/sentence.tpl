<tr class='aproto'>
  <td>
    <b><?php echo htmlspecialchars($this->sentence['name'], ENT_QUOTES); ?></b>
    <input type='hidden' class='pageID' value='<?php echo $this->sentence['id']; ?>' />
  </td>
  
</tr>

<tr class='areviewedsentence row1'>
  <td>
    <?php echo htmlspecialchars($this->sentence['rep'], ENT_QUOTES); ?>
  </td>
  
</tr>

