from django.db import models


class ParentModel(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class ChildModelTabular(models.Model):
    parent = models.ForeignKey(
        ParentModel, on_delete=models.CASCADE, related_name="tabular_children"
    )
    title = models.CharField(max_length=100)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return self.title


class ChildModelStacked(models.Model):
    parent = models.ForeignKey(
        ParentModel, on_delete=models.CASCADE, related_name="stacked_children"
    )
    note = models.TextField()
    is_important = models.BooleanField(default=False)

    def __str__(self):
        return f"Note in {self.parent.name}"
