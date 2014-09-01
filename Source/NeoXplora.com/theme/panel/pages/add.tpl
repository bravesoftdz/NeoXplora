<?php echo $this->fetch("header"); ?>
<div id="content">
  <div class="container relative">
    <div class="panel">
      <div class="buttons">
        <a href="panel.php?type=pages">Manage Page</a>
        <a href="panel.php?type=pages&action=add" class="active">Add Page</a>
      </div>
        
      <form action="panel.php?type=pages&action=add" method="post">
        <table class="pagesForm">
          <tr>
            <td>Title:</td> 
            <td><input type="text" name="pageTitle" value ="<?php echo $this->pageData['Title']; ?>" /></td>
          </tr>
          <tr>
            <td>Category:</td> 
            <td>
              <select name="categoryId" style="width: 304px;padding: 5px;">
                <?php foreach($this->categoryList AS $key => $value) { ?>
                  <option value="<?php echo $key; ?>" <?php if($this->pageData['CategoryId'] == $key) echo "selected='selected'"; ?>>
                    <?php echo $value; ?>
                  </option> 
                <?php } ?>
              </select>
            </td>
          </tr>
          <tr>
            <td>Body:</td>
            <td><textarea name="pageBody"><?php echo $this->pageData['Body']; ?></textarea></td>
          </tr>
          <tr>
            <td></td>
            <td><input type="submit" name="submit" value="Add Page" style="width: 100px; float: right;" /></td>
          </tr>
        </table>
      </form>
    </div>
  </div>
</div>
<?php echo $this->fetch("footer"); ?>