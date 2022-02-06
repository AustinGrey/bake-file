# Recipe Format

In order to store and search/operate on recipes, there needs to be a format to work with. The format should fit into the following

- Flexible
  - Recipes vary across generations and geographies. The format should be prepared to expand when new use cases appear, or be allowed to change for individual use cases. Specific challenges include recipes that come in volume or weight measurements not part of the metric standard, have sub recipes or refer to other recipes, have possible substitutions or suggested alternatives to ingredients, translations, changes due to altitude and ambient temperature, etc.
- Support the tradeoff between simplicity and precision
  - An ideal recipe is unambiguous. A recipe in this format should be interpretable by a computer for the purpose of understanding the recipe’s nutrition, time (hands on and hands off) and cost requirements. However in the interest of simplicity, it should not be a hassle to create a recipe in this format in a less precise way, and upgrade it later to be more and more precise. Interpreters of this format should require very little data in order to present the recipe to a human, but be capable of taking advantage of the more precise information when offered. A human should be able to type a recipe in this format very quickly, and full fat recipes with large amounts of meta data should also be something that can be created (even if large recipes like that are less human readable).
- Unassuming
  - Not everyone owns an oven and range. Hotplates are equivalent to ranges in some situations. Is a garlic press really necessary? Keywords in the format should avoid referring to tools users may not have, or have in a different way.
- Avoid repetition
  - Repetition kills motivation, and re-use is a springboard for innovation. The format should support re-use.

# Some Recipe formats investigated

- Open Recipe
  - [https://open-recipe-format.readthedocs.io/en/latest/topics/reference/orf.html](https://open-recipe-format.readthedocs.io/en/latest/topics/reference/orf.html)
  - Breaks the unassuming rule (e.g. oven-fan key. Users may not have an oven, this also assumes an oven fan indicates convection, why not call it “convection” then?)
  - I like the idea that as recipes scale, the proportion of ingredients may not scale linearly with respect to each other. A concept worth supporting
- RecipeML
  - [http://www.formatdata.com/recipeml/spec/recipeml-spec.html](http://www.formatdata.com/recipeml/spec/recipeml-spec.html)
  - XML is not human friendly
- Meal Master
  - [https://www.wedesoft.de/software/2020/07/07/mealmaster/](https://www.wedesoft.de/software/2020/07/07/mealmaster/)
  - Strange arbitrary requirements (Meal-Master in header? A header at all seems arbitrary)
  - Includes metric and imperial and old english units, but does not support custom units
  - Requires odd formatting for ingredients
- Others
  - [https://microformats.org/wiki/recipe-formats](https://microformats.org/wiki/recipe-formats)
  - Most listed are XML or HTML, neither which are easy to write

# Some file formats investigated

- TOML
  - I like it’s simplicity, optional indentation is a HUGE benefit for non-programmers to be able to write something in. Having to escape keys with [] and prefix nested keys is a huge downside. But how far do we expect something to nest in the recipe format?
  - Quoted strings vs unquoted in YAML
- YAML
  - Full power, full responsibility. A recipe written in literal YAML syntax is easy to read, but a massive JSON syntax recipe would be unrecognizable to most users, and harder to edit. Requiring space indentation for YAML syntax is an annoyance.
  - YAML supports recursive structures. Which is absolutely required for some recipes (amish bread, sourdough, etc.), though it’s unclear if self references really need file format support for that, or can be implemented within any given format.
- Dockerfiles and gitlab yml
  - Have really nice rigorous ways to extend from other formats

# Exploring Requirements

A recipe file parser should seek to fail gracefully. Because different parsers might make different choices about what a ‘graceful’ failure is, but we want files to be unambiguous, it is essential to define fallbacks for almost all keys if not specified

- `ingredients`
  - custom units
  - imperial units MUST NOT be built into clients, indeed it would be difficult to require clients to implicitly support them, as they have different definitions across geographies (the tablespoon for example is different in canada, the us, and australia separately!) However the translations of these units to metric is well defined in local geographies, and explicitly to the authors of recipes. So clients MAY and are encouraged to provide quick options to embed the definitions of local custom units into their recipes. See units.
  - Empty/unspecified
    - This recipe has no ingredients. This could be because the recipe is for an indivisible ‘food’ which is just being specified to provide the nutritional value, or because the ingredients are not yet known. In this situation, if you are crawling a recipe’s ingredients recursively (for example, to create a shopping list of ingredients) and arrive to a ingredient in a recipe that itself is a recipe but has no ingredients, it is suggested to treat the recipe itself as an ingredient.
  - Mixed array of
    - Strings (format ‘i s’)
      - The amount and name of a recipe. The amount is considered to be a multiplier of the entire yield of the recipe if a linked recipe can be found (e.g. 1 egg).
    - Strings (format ‘i s s’)
      - The amount, unit and name of an ingredient. The unit must be a metric unit, or a custom unit defined in the units key, otherwise this string will be parsed as in the ‘i s’ format case.
    - Strings (format ‘s i s’)
      - The name of an ingredient, followed by the the amount and unit. There are no restrictions in this format since we can always detect the amount as the last number (even if for some reason the name of an ingredient contains a number).
    - Array of Ingredient specifications
      - List of possible ingredients, with the expectation be that you choose exactly 1 from the list
    - Ingredients Objects
      - `name`
        - A simple ingredient, which can be implicitly linked to a recipe if one can be found
        - String
          - The name of the ingredient. Should not be provided if the recipe key was provided. if it is an exact match to the name of a recipe found in the file (either by being declared in the same file or by being imported from another file), then it is safe to consider this ingredient to be the result of that recipe unless the units provided cannot be meaningfully interpreted from the results of that recipe.
      - `amount`
        - Empty/Unspecified
          - If name was specified: 1 g
          - If recipe was specified: 1
          - If neither was specified: 1
        - Decimal
          - If name was specified
            - If the ingredient is not linked to a recipe, then the preferred recipe is the recipe defining this ingredient, otherwise it is the linked recipe
            - If half or more of the preferred recipe’s ingredients are specified as weight units, then this is the amount of the ingredient in grams
            - Otherwise this is the amount of the ingredient in ml
          - If recipe was specified
            - Then this is a multiplier for the entire yield of a recipe (e.g. 1 sandwich)
        - String (format ‘i s’)
          - The amount and unit of the ingredient
        - Array of exactly size 2
          - The individual components here can switch order, they should be detected by the type of data they contain, not by the order in which they appear
            - Decimal or a String with a valid Decimal conversion
              - The number of units of the ingredient
            - String which cannot be converted to Decimal
              - The units of the ingredient
      - `recipe`
        - An explicit indication that the ingredient is in fact a recipe that is defined elsewhere
        - String
          - The name of the recipe to link to, the parser must attempt to search for the recipe within all referenced files for a matching name. If one cannot be found it should treat this key as if the name key was specified with this value. In this situation, clients must provide a warning of a misused key.
        - A recipe definition
          - An in-lined recipe definition. Rather than refer to a recipe defined elsewhere, it can help to put an entire recipe definition inside another. Keeping highly coupled recipes together. This could be for a specific sauce for a main dish, which would otherwise clutter the main dish recipe. Clients should be capable of flattening nested definitions if the user requires, so this should not be an issue.
    - Alternatives Objects
      - `pick`
        - Integer
          - The number of items that should be picked from the options
      - `options`
        - Array of ingredient definitions
          - The available options to choose from
- `instructions`
  - Empty/Unspecified
    - This recipe has no instructions. That might be because it's just being used to explain nutritional value of a food item, or collection of items.
  - String
    - This recipe has just one instruction. Or the instructions are written as a paragraph. Writing multiple instructions as a paragraph is discouraged but supported because that's a common human thing to do.
  - Array of strings
    - Each step is listed individually as a freeform paragraph
  - Array of objects
    - `time`
      - Empty/Unspecified
        - The sum of `activeTime` + `passiveTime` . This may not result in metric time units if the other times are specified in unconvertable time units (e.g. ‘1 afternoon’ + “1 min”, and ‘afternoon’ is not listed in the custom units section results in “1 afternoon, 1 min”)
      - Int
        - The amount of time in minutes this step is expected to take
      - String (format “i s”)
        - The amount in specified units of time the step is expected to take
    - `activeTime`
      - How much time is required with the chef actively engaged (e.g. chopping is active, waiting for something to cook is passive)
      - Empty/Unspecified
        - Treated as 0
      - Int
        - The amount of time in minutes during the step the chef is actively engaged
      - String (format “i s”)
        - The amount of time in specified units the chef is actively engaged
    - `passiveTime`
      - How much time is required with the chef not actively engaged (e.g. chopping is active, waiting for something to cook is passive).
      - Empty/Unspecified
        - Treated as 0
      - Int
        - The amount of time in minutes during the step the chef is not actively engaged
      - String (format “i s”)
        - The amount of time in specified units the chef is not actively engaged
    - `first/then/step`
      - String
        - The process to follow for this instruction. It has aliases to improve readability (first do this, then do that)
    - Because a combination of any two of `time`, `passiveTime`, and `activeTime` allows you to derive the remaining property, all three should not be specified at once. If however all three are, `time` is ignored in favor of the sum of the remaining two.
- `name`
  - Optional, String
  - It must never be assumed to be unique, even relative to recipes in the same file (as an export might wish to put all recipes in a database into a single file for example).
  - Empty/Unspecified
    - The name will be considered as if the string “Unknown Recipe”
  - String
    - Human readable identifier for the recipe.
- `portions`
  - Optional, the number of indivisible portions a recipe creates if it does so (e.g. 1 sandwhich)
  - Empty/Unspecified
    - considered to be a mass noun recipe rather than a count noun recipe, so portions do not make sense and should not be reported. E.g. Cooked white rice as a recipe does not make sense to be portioned, as it can be divided into any smaller amounts, but a sandwich is not so obviously divided
  - Integer
    - the number of portions, which will be referred to as “portion(s)” by software. E.g 1 portion
  - String (format ‘i s’)
    - the number of portions whitespace separated from a singular name for that portion (plural rules vary between items and languages, easier for computers to follow if we know it’s the singular form)
  - Object
    - `count`
      - Integer
        - the number of portions
    - `name`
      - String
        - the name for a single portion
- `references`
  - @todo this feels like something that belongs in a file which defines multiple recipes, rather than in a single recipe.
  - points to other recipes which could be included. References can be informal, but every effort should be made to parse the references to look for other recipe definitions which could be imported.
  - String (format: URI)
    - A URI that identifies a recipe file which contains information the author wishes to be available in the current recipe definition file. Conflicts within a file are resolved by the last encountered definition in a file having precedence.
  - Array of Strings (format: URI)
    - A set of URI’s that identify recipe files. Conflicts between files are resolved by the last listed file having precedence.
- `tools` (e.g. oven, convection, knife, popcorn kettle)
  - Optional, Array of strings or comma separated string
  - Tools fall into two categories. Specific tools (e.g. a convection oven capable of 200C), or general categories (E.g. convection heat capable of 200C, which could be fulfilled by a toaster oven, air fryer set to low, or a conventional convection oven). I anticipate humans would prefer to write specific tools, but computers should encourage general categories.
  - At what point does a recipe take effect? E.g. a recipe that requires diced carrots could easily list carrots as an ingredient, but then list dicing them as a step. Alternatively it could just list diced carrots. This would be the difference between needing a cutting tool or not. Although I would prefer to state that individual ingredients would be prepped as far as they could by themselves, the distinction is not clear. Sauted onions would be very uncommon to see as an ingredient, but diced carrots highly common I would say. Sauted onions is possibly ambiguous, since it's a multi-ingredient recipe, you could use butter, or oil, saute until clear, or browned. Diced carrots is less ambiguous, one ingredient, one tool. I would say then that because a complex ingredient is only ambiguous in the case it is not linked to a real recipe, that you should always use the most prepared unambiguous ingredient listed possible. So if you had a sauted onions recipe to link to, then link and list that. Otherwise you should include the ingredients and steps into your recipe.
- `units`
  - Optional, allows defining custom units if metric units are not desired
  - String (format ‘s’)
    - A quick and dirty short hand for defining a single un-comparable custom unit. This unit cannot be converted to metric, possibly because it standard definitions of volume or weight are irrelevant to ingredients with this unit. An example might be bespoke decorations. E.g. ‘1 umbrella’ for a fancy drink, does not make sense to convert to g or ml, and although one umbrella is not equivalent to another, they are in practice interchangeable. This provides a potential avenue for abuse when ‘bachelor’ recipes are created (e.g. I remember a peanut butter ball recipe that was ‘1 can of sweetened condensed milk, 1 jar of peanut butter, and 1 package of chocolate chips’) but supporting humans where they are writing recipes encourages the recipes to get written, and clients can provide help to improve the recipes specificity over time.
  - String (format ‘i s = i s’)
    - A quick and dirty short hand for defining a single quantitative custom unit. The custom unit may be on either side of the ‘=’ character. However the other unit must be a metric unit or unit with a known conversion to metric (possibly because it is defined in another file and was imported here).
    - If a conversion to metric cannot be found, then the client MUST provide a warning to the user, and the unit must be treated as if the ‘i s’ of the custom unit was the ‘s’ of the previously defined format. That is, as a bespoke un-comparable custom unit.
    - In the case where a custom unit has been defined multiple times, the first encountered definition wins, from inside out. That is
      - If A imports B, and B imports C, then A’s definition wins over B, and B’s definition wins over C
      - Parent recipe’s should be able to see units defined inside nested recipes. But nested recipes will not be able to see units defined inside their parent. This is because the nested recipe is imported by the parent, not the other way around. @todo this feels wrong, since its the
        exact opposite of closure in programing, can I reconcile this?
  - Array of exactly 2 strings of format ‘i s)
    - As the String (format ‘i s = i s’) case, but using array notation instead of an equals sign to reduce ambiguity
  - Array of any of the previously defined definition formats
    - An array of such strings, for defining multiple custom units.
    - This format additionally should support defining custom units in terms of other custom units in the same array, and it should be able to resolve such chains of definition regardless of the order in which units are defined.
    - In case of multiple definitions for the same unit within a list, the client should raise a warning, but the first definition encountered when processing the list from top to bottom always takes priority.
- `alters`
  - a link to a recipe or pair of recipes this recipe is an alteration of. The definitions of this recipe are merged or overwritten according to the following criteria, assuming that the recipes are processed in the order written, and then ending with this current recipe definition
    - Array like keys (which may not be array values, but can be coerced into one because a definition for the key supports an array containing the current value)
      - Are concatenated to the start of the previous encountered array value. E.g. if B alters A, then B’s instructions will appear before A’s instructions.
      - A client may choose to provide a sorting for some keys. For example, sorting the ingredients by weight/volume. In which case it would be possible to logically interleave the imported ingredients. However the option to sort by import order MUST be preserved.
    - Otherwise the last encountered value for a key is the value used.
- `yield`
  - Optional, the weight or volume of food this recipe produces.
  - Empty/Unspecified
    - If half or more of the ingredients are specified in weight units, the yield is considered to be weight. It is calculated as the sum of the weights of weight specified ingredients, plus the sum of all volume specified ingredients with known density converted to weights, plus the sum of all volume specified ingredients with unknown density converted to weight by assuming the ingredient has the density of water (1g/ml)
    - Otherwise the yield is considered to be volume. It is calculated as the sum of the volumes of the volume specified ingredients, plus the volumes of the weight specified ingredients of known density converted to volume, plus the volumes of the weight specified ingredients of unknown density converted to volume assuming the ingredient has the density of water (1g/ml)
    - For ingredients where density is unknown, the client is free to attempt to lookup a more accurate density from well known lookup tables. It should not do this without some method of the user knowing that the lookup was performed automatically and may be inaccurate. It should never resolve to a density or inverse density of 0.
  - Integer
    - If half or more of the ingredients are specified in weight units, this is the number of grams the recipe produces
    - Otherwise, the number of ml the recipe produces
  - String (format ‘i s’)
    - The amount and units the recipe produces. The unit can be a custom unit but if so must be defined with a conversion to a known metric unit.
- `nutrition`
  - Should specific nutritional values be a part of the spec? On one hand there are nutritional values that seem universally accepted (fats, carbohydrates, and proteins), but even those well regarded macros get broken down and can be considered separately. Saturated and trans fat are part of fats, and are considered undesirable compared to polyunsaturated fats. Sugars are carbs, and considered undesirable compared to many other carbs. So any attempt to rigorously define even the most high level macros sends us down a rabbit hole of not supporting the information people would normally track. The only solution then is to define a general key with no assumptions so that we can support anything people might be concerned about as the scientific community improves their ability to detect and decide on what should and should not be concerning.
  - Empty/Unspecified
    - The client should crawl the ingredients list in an attempt to calculate the nutritional information. If an ingredient’s nutritional information cannot be determined, then the client should calculate the uncertainty caused by this unknown ingredient according to its percentage of the weight of the recipe’s total ingredients (converting volume measurements to weight, and using the density of water for ingredients of unknown density). If an unconvertible unit is found, the client MAY choose to ignore it or simply refuse to calculate the nutritional information until more information is provided. If ignoring, the client MUST show a warning indicating the uncertainty is itself uncertain.
  - String (format after whitespace collapsing is a character delimited ‘s i’ or ‘i s’)
    - If the string can be parsed as the specified format, it should instead be treated as if the object format was specified with the parsed information. Any errors and it will instead be treated as a free form string
  - String (format freeform)
    - Nothing can be done here, the nutritional information is unparsable. A warning should show that the information was not parsable and instead the nutritional information should instead be obtained as if this key was not specified.
  - Array of Strings (format “i s s” or “s i s”)
    - Treated as if object notation with s as the key and ‘i s’ as the value and unit. If duplicate keys are found, then the last key will take precedence.
  - Array of Strings (format “i s” or “s i”)
    - Treated as if object notation with s as the key and ‘i’ as the value in grams. If duplicate keys are found, then the last key will take precedence.
  - Object
    - `[key: string]: INT`
      - The object key is the name of the nutrient, the int is the value in grams
    - `[key: string]: String (”i s” or “s i”)`
      - The object key is the name of the nutrient, the string is parsed as the value in given units
    - `[key: string]: Object`
      - `name`
        - String
          - The name of the nutrient
      - `amount`
        - Empty/Unspecified
          - the amount is determined from the breakdown entirely
        - Int
          - the amount of the nutrient in grams, or units if units is specified
        - String (format ‘i s’ or ‘s i’)
          - the amount of the nutrient in given units
      - `unit`
        - The unit for the amount. Ignored if amount is specified in a way that would define units. A warning should be given in this instance
      - `breakdown`
        - any valid nutrition specification
          - The breakdown of subsets of this nutrient (e.g. if ‘fat’ is specified as 10g, this would be how you specify 3g of that is ‘saturated fat’).
          - If the breakdowns add up to MORE than the amount specified for the parent, then the amount specified in the parent is ignored and the sum of the breakdowns is used instead. A warning MUST be shown in this case.
          - If the breakdowns add up to LESS than the amount specified, then the remainder is considered to just be the parent nutrient without further specification (e.g. in the previous example that would leave 7g of unspecified ‘fat’)
  - Array of Objects
    - Merged together and treated as one object, if duplicate keys exist then the last specified key takes precedence.
- `versions`
  - previous
    - Indicates that this recipe had a previous version. This is important since the extends keyword allows building off of an existing recipe, this allows indicating that a new recipe exists that may have replaced, updated, or deprecated ingredients/steps, without immediately breaking recipes that are linked elsewhere
  - next
    - Companion keyword to previous

```yaml
# A simple example
name: Grilled Cheese
yield: 230g
portions: 1 sandwhich
tools: contact heat @ 375C
ingredients:
  # Because 'cheese slice' is not a custom unit,
  # this would look for a recipe called 'cheese slice' if it can
  - 1 cheese slice
  - 2 bread slice
  # This looks for an ingredient called 'butter' if imported, for nutritional information
  - 5g butter
instructions:
  - put butter on one side of each slice of bread
  - assemble bread in contact heat source at 375C with butter on outside of slices, and cheese on the inside of slices
  - Once bottom is golden brown, flip and wait until second side is golden brown
  - serve hot
```

```yaml
# Simplest recipe for a frozen food item. 1 instruction. You do still need
# to specify portions because otherwise it will be treated as a mass noun rather
# than a countable noun and a computer might think 0.2 chicken burgers is a valid
# sugggestion of what to eat
name: Chicken Burger (from frozen)
portions: 1
instructions: heat in oven 20 minutes @ 425F

------

# Improve specificity.
# The instruction is now clearly just 1 step, and the ingredients are specified,
# which means the name can now be less specific because the ingredient is more specific.
name: Chicken Burger
portions: 1
ingredients:
  # since chicken burger is not a custom unit, it is treated as a recipe
  # since no recipe is linked, then it is treated as indivisible. A grocery
  # list would list 1 chicken burger
  - 1 chicken burger (frozen)
instructions:
  - heat in oven 20 minutes @ 425F

------

# Improve specificity.
name: Chicken Burger
portions: 1
ingredients:
  # since chicken burger is not a custom unit, it is treated as a recipe
  # since no recipe is linked, then it is treated as indivisible. A grocery
  # list would list 1 chicken burger
  - 1 chicken burger (frozen)
instructions:
  - heat in oven 20 minutes @ 425F
```

## Yield vs Serving Suggestion

- How much food does a recipe make? By default it seems like it would just be the sum total of all ingredients, but some ingredients get discarded (bay leaves, boiled down broths). Does a serving suggestion make sense since the goal is an app that will tell you how much of a food to eat?
- Yield seems more appropriate to list “the number of grams of the output of this recipe”
- Serving size seems more appropriate to list “the number of grams of this recipe you would consider a good portion for a meal”
- Yield seems to be well defined. Serving size varies from individual, and over time. Especially as nutritional goals change. Serving size survives because it is useful when people are planning a recipe for multiple people to eat from though. Maybe serving size should be left out for now since the assumption is that a computer would calculate the appropriate serving size for you, but PORTIONS is still meaningful, since it’s nice to know a dumpling recipe makes 12 dumplings, as grams are hard to visualize
- End result: spec must **not** include serving size

# Challenges

- What about multiple versions of a recipe. Explicitly, not multiple variations of a recipe with different results, but 2 recipes which are different, but produce the same results. E.g. Amish bread starter you are able to create a starter with basic ingredients, or by adding ingredients to amish bread starter to make... more starter). This complicates searching for matching recipes.
- Simultaneous steps. Some steps do not depend on others which are written earlier. Some steps may and should happen simultaneously (e.g. waiting for dough to rise while you grate cheese). How can instructions indicate this clearly?
