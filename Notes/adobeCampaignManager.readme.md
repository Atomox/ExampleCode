# Adobe Campaign Manager

- ACM (Classic) vs ACS
- ACS is a web based tool, where ACM requires a server/client installation.
- Adobe Prime is the connector between ACS and ACM


## Contact Info / Client List
- Explorer, Profiles & Targets > Receipients > Training
- Custom Fields for view can be added with e4xml (ES 4 + XML)
  - example: [location/@city]+','+[location/@stateCode]

  <x>

  <y z="hi"/>
  </x>

  - y/@z

- Admin > Config > Data Schemas

- Reserved Namespaces: xtk,nms,nl,ncm, (Adobe) -and- neo,cus (Examples)
- Namespaces are 3 characters are all lowercase, 3 letters.





## Data Schema
Find here: `Admin > Config > Data Schemas`

Construct XML schemas, which Adobe will use to define database tables. Once you save these, you still have to update the DB, like running cron.

After modifying, visit this and update your field:
- Update schema: tools > Advanced > Update Database Structure


```
<srcSchema _cs="Orders (bth)" created="2017-08-28 15:18:13.525Z" createdBy-id="0"
           desc="Transaction" entitySchema="xtk:srcSchema" img="xtk:schema.png" label="Orders"
           labelSingular="Order" lastModified="2017-08-28 18:38:27.628Z" mappingType="sql"
           md5="C62BE7A592F0C9F110D1AA9F751E1D57" modifiedBy-id="0" name="order"
           namespace="bth" xtkschema="xtk:srcSchema">
  <createdBy _cs="Ben Helmer (ben)"/>
  <modifiedBy _cs="Ben Helmer (ben)"/>


  <element autopk="true" desc="Transaction" label="Orders" labelSingular="Order"
           name="order">
    <attribute label="Store" length="40" name="store" type="string"/>
    <attribute label="Qty" name="quantity" type="long"/>
    <attribute label="Amount(USD)" name="amount" type="double"/>
    <attribute label="Time of Sale" name="datetimeOfSale" type="datetime"/>

    <dbindex name="store">
      <keyfield xpath="@store"/>
    </dbindex>

    <!-- Links -->
    <element label="Item Purchased" name="product" target="bth:product" type="link"/>
    <element label="Buyer" name="buyer" target="nms:recipient" type="link"/>
  </element>


</srcSchema>
```


## Forms
Find here: `Admin > Config > Input Forms`
Build forms, like Drupal's Form API, to construct admin forms for entering data.

```
<form _cs="BTH Orders (bth)" created="2017-08-28 19:31:30.709Z" createdBy-id="727363"
      entitySchema="xtk:form" img="xtk:form.png" label="BTH Orders" lastModified="2017-08-28 20:45:40.213Z"
      md5="C55CCCF90F5EEBE4613E94F77899E434" modifiedBy-id="727363" name="order"
      namespace="bth" type="iconbox" xtkschema="xtk:form">
  <createdBy _cs="Ben Helmer (ben)"/>

  <!-- Everything above here is default from Wizard -->
  <!-- Custom Tab with image -->
  <container img="nl:navtree/offer.png" label="Transaction Info: ">
    <input xpath="@store"/>
    <input xpath="@datetimeOfSale"/>
  </container>

  <!-- Custom Tab with image icon -->
  <container img="nl:navtree/offer.png" label="Transaction Details">
    <input xpath="@amount"/>
    <input xpath="@quantity"/>
    <input xpath="product"/>
    <input xpath="buyer">
      <!-- Filter on the field -->
      <sysFilter>
        <condition expr="[location/@city]='Clinton'"/>
      </sysFilter>
    </input>
  </container>
</form>
```


### expr
Any value in `EX4` language (JS4 + XML) is usable.
<condition expr="[location/@city]='Clinton'"/>

 - []
    - E.X. ```[location/@city]```
      - [] = xpath (XML query)
      - `location/@city` is a field


### Filters
Filter a field based on some conditions.
```
<sysFilter name="someName">
  <condition expr="[location/@city]='Clinton'"/>
  <condition enabledIf="$(loginID!=0)">
</sysFilter>
```


## Navigation Hierarchies
Find here: `Admin > Config > Navigation Hierarchies`

Add items (forms) to the menu system.

```
<navtree _cs="BTH Order NaveTree (bth)" created="2017-08-28 20:06:44.721Z" createdBy-id="727363"
         entitySchema="xtk:navtree" img="nl:folders.png" label="BTH Order NaveTree"
         lastModified="2017-08-28 20:13:54.937Z" md5="3F07024FDBC5941F0BA53F6AB0CB6281"
         modifiedBy-id="727363" name="order" namespace="bth" xtkschema="xtk:navtree">
  <createdBy _cs="Ben Helmer (ben)"/>
  <modifiedBy _cs="Ben Helmer (ben)"/>

  <!-- Custom Code -->
  <model name="root">
    <model label="BTH Sales" name="cus:sales">

      <!-- Single Item -->
      <nodeModel img="nl:home.png" label="BTH Products" name="bthProducts">
        <view name="bthProductList" schema="bth:product" type="listdet">
          <columns>
            <node xpath="@sku"/>
            <node xpath="@category"/>
            <node xpath="@description"/>
          </columns>
        </view>
      </nodeModel>

      <!-- Single Item -->
      <nodeModel img="nl:navtree/offer.png" label="BTH Orders" name="bthOrder">
        <view name="bthOrderList" schema="bth:order" type="listdet">
          <columns>
            <node xpath="@store"/>
            <node xpath="@quantity"/>
            <node xpath="@amount"/>
            <node xpath="@datetimeOfSale"/>
          </columns>
        </view>
      </nodeModel>
    </model>
  </model>
</navtree>
```